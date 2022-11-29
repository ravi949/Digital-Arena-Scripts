/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope TargetAccount
 */
define(['N/render', 'N/record', 'N/runtime', 'N/format', 'N/file', 'N/search', 'N/email', 'N/config'],
	function(render, record, runtime, format, file, search, email, config) {
		/**
		 * Definition of the Suitelet script trigger point.
		 *
		 * @param {Object} context
		 * @param {ServerRequest} context.request - Encapsulation of the incoming request
		 * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
		 * @Since 2015.2
		 */
		function onRequest(context) {
			try {
				var params = context.request.parameters;
				//	log.debug('params', context.request.headers);
				var myTemplate = render.create();
				// if(params.formid == '112'){
				myTemplate.setTemplateByScriptId({
					scriptId: "CUSTTMPL_PAYSLIP_TEMPLATE"
				});
				var payslipRecord = record.load({
					type: 'customrecord_emp_request_for_payslip',
					id: params.recID
				});
				var empBasicSalary = payslipRecord.getValue('custrecord_emp_basic_salry');
				var empEmail = payslipRecord.getValue('custrecord_employee_email');
				var configRecObj = config.load({
					type: config.Type.COMPANY_INFORMATION
				});
				var accountId = configRecObj.getValue('companyid');
              	accountId = accountId.replace(/_/g, '-');
				var logourl = "";
				var origin = "https://" + accountId + ".app.netsuite.com";
				var featureEnabled = runtime.isFeatureInEffect({
					feature: 'SUBSIDIARIES'
				});
				//log.debug(featureEnabled);
				if (featureEnabled) {
					var subsidiaryId = payslipRecord.getValue('custrecord_emp_subsidiary');
					var subsidiaryRecord = record.load({
						type: 'subsidiary',
						id: subsidiaryId
					});
					if (subsidiaryRecord.getValue('logo')) {
						var fieldLookUpForUrl = search.lookupFields({
							type: 'file',
							id: subsidiaryRecord.getValue('logo'),
							columns: ['url']
						});
						log.debug('fieldLookUpurl', fieldLookUpForUrl.url);
						logourl = origin + "" + fieldLookUpForUrl.url;
					}
				} else {
					var companyLogo = configRecObj.getValue('pagelogo');
					if (companyLogo) {
						var fieldLookUpForUrl = search.lookupFields({
							type: 'file',
							id: companyLogo,
							columns: ['url']
						});
						//log.debug('fieldLookUpurl', fieldLookUpForUrl.url);
						logourl = origin + "" + fieldLookUpForUrl.url;
					}
				}
				//log.debug('fieldLookUp', subsidiaryRecord.getValue('logo'));
				var empId = payslipRecord.getValue('custrecord_payslip_employee');
				var periodId = payslipRecord.getValue('custrecord_emp_payslip_select_month');
				var periodName = payslipRecord.getText('custrecord_emp_payslip_select_month');
				var empName = payslipRecord.getText('custrecord_payslip_employee');
				//log.debug('myfile1', payslipRecord);
				myTemplate.addRecord('record', payslipRecord);
				var customrecord_da_pay_run_itemsSearchObj1 = search.create({
					type: "customrecord_da_pay_run_items",
					filters: [
						["custrecord_da_pay_run_employee", "anyof", empId],
						"AND",
						["custrecord_da_pay_run_scheduling.custrecord_da_sch_pay_run_period", "anyof", periodId],
                                            
						"AND",
						["custrecord_da_payroll_item_type", "anyof", "1"],
						"AND",
						["custrecord_da_pay_run_paroll_items.name", "contains", "salary"]
					],
					columns: [
						'custrecord_da_pay_run_item_amount', 'custrecord_da_pay_run_paroll_items'
					]
				});
				var searchResultCount = customrecord_da_pay_run_itemsSearchObj1.runPaged().count;
			log.debug(" basic customrecord_da_pay_run_itemsSearchObj result count",searchResultCount);
				var basicsalary = 0;
				customrecord_da_pay_run_itemsSearchObj1.run().each(function(result) {
					var amount = result.getValue({
						name: 'custrecord_da_pay_run_item_amount'
					});
					if (amount > 0) {
						basicsalary = parseFloat(amount);
					}
				});
              
              
              //loan payable amount 
              //
              var customrecord_da_emp_special_termsSearchObj = search.create({
                   type: "customrecord_da_emp_special_terms",
                   filters:
                   [
                     ["custrecord_da_sp_terms_payroll_item.custrecord_da_payrol_item_category","anyof","41"],"AND",
                      ["custrecord_da_sp_term_type","anyof","2"],
                      "AND", 
                      ["custrecord_da_sp_term_employee","anyof",empId]
                   ],
                   columns:
                   [
                      search.createColumn({name: "custrecord_da_sp_term_instalment_amount", label: "Instalment Amount"}),
                      search.createColumn({name: "custrecord_da_paid_amount", label: "Paid Amount"}),
                      search.createColumn({name: "custrecord_da_sp_term_total_amount", label: "Total Amount"})
                   ]
                });
                var loanPayableAmount = 0;
                customrecord_da_emp_special_termsSearchObj.run().each(function(result){
                   var totalAmount = result.getValue('custrecord_da_sp_term_total_amount');
                   var paidAmount = result.getValue('custrecord_da_paid_amount');
                   var balance = parseFloat(totalAmount) - parseFloat(paidAmount);
                  if(paidAmount){
                     loanPayableAmount = parseFloat(loanPayableAmount) + parseFloat(balance);
                  }else{
                     loanPayableAmount = parseFloat(loanPayableAmount) + parseFloat(totalAmount);
                  }
                 
                   return true;
                });
              
              //special Loan Amount 
              var specialloanAmount = 0;
              var customrecord_da_emp_special_termsSearchObj = search.create({
                   type: "customrecord_da_emp_special_terms",
                   filters:
                   [
                      ["custrecord_da_sp_terms_payroll_item.custrecord_da_payrol_item_category","anyof","52"], 
                      "AND", 
                      ["custrecord_da_sp_term_employee","anyof",empId]
                   ],
                   columns:
                   [
                      search.createColumn({
                         name: "id",
                         sort: search.Sort.ASC,
                         label: "ID"
                      }),
                      search.createColumn({name: "custrecord_da_sp_terms_payroll_item", label: "Payroll Item"}),
                      search.createColumn({name: "custrecord_da_sp_term_total_amount", label: "Total Amount"}),
                      search.createColumn({name: "custrecord_da_sp_term_frequency", label: "Frequency"}),
                      search.createColumn({name: "custrecord_da_sp_term_instalment_amount", label: "Instalment Amount"}),
                      search.createColumn({name: "custrecord_da_sp_term_description", label: "Description"}),
                      search.createColumn({name: "custrecord_da_paid_amount", label: "Paid Amount"})
                   ]
                });
                var searchResultCount = customrecord_da_emp_special_termsSearchObj.runPaged().count;
                //log.debug("customrecord_da_emp_special_termsSearchObj result count",searchResultCount);
                customrecord_da_emp_special_termsSearchObj.run().each(function(result){
                  
                   var totalAmount = result.getValue('custrecord_da_sp_term_total_amount');
                   var paidAmount = result.getValue('custrecord_da_paid_amount');
                   var balance = parseFloat(totalAmount) - parseFloat(paidAmount);
                  if(paidAmount){
                     specialloanAmount = parseFloat(specialloanAmount) + parseFloat(balance);
                  }else{
                     specialloanAmount = parseFloat(specialloanAmount) + parseFloat(totalAmount);
                  }
                   
                   return true;
                });
				var customrecord_da_pay_run_itemsSearchObj = search.create({
					type: "customrecord_da_pay_run_items",
					filters: [
						["custrecord_da_pay_run_employee", "anyof", empId],
						"AND",
						["custrecord_da_pay_run_scheduling.custrecord_da_sch_pay_run_period", "anyof", periodId],
						"AND",
						["custrecord_da_payroll_item_type", "anyof", "1"],
						"AND",
						["custrecord_da_pay_run_paroll_items.name", "doesnotcontain", "salary"]
					],
					columns: [
						'custrecord_da_pay_run_item_amount', 'custrecord_da_pay_run_paroll_items'
					]
				});
				var searchResultCount = customrecord_da_pay_run_itemsSearchObj.runPaged().count;
				//log.debug("customrecord_da_pay_run_itemsSearchObj result count",searchResultCount);
				var earningsObj = {};
				var i = 1;
				var earningAmount = 0;
				customrecord_da_pay_run_itemsSearchObj.run().each(function(result) {
					var amount = result.getValue({
						name: 'custrecord_da_pay_run_item_amount'
					});
					if (amount > 0) {
						earningAmount = parseFloat(earningAmount) + parseFloat(amount);
					}
					earningsObj["line" + i] = {
						'payrollitem': result.getText('custrecord_da_pay_run_paroll_items'),
						'earnlineamount': addZeroes(amount.toString())
					};
					i++;
					return true;
				});
				var deductionsObj = {};
				var k = 1;
				var customrecord_da_pay_run_itemsSearchObj = search.create({
					type: "customrecord_da_pay_run_items",
					filters: [
						["custrecord_da_pay_run_employee", "anyof", empId],
						"AND",
						["custrecord_da_pay_run_scheduling.custrecord_da_sch_pay_run_period", "anyof", periodId],
						"AND",
						["custrecord_da_payroll_item_type", "anyof", "2"]
					],
					columns: [
						'custrecord_da_pay_run_item_amount', 'custrecord_da_pay_run_paroll_items'
					]
				});
				var searchResultCount = customrecord_da_pay_run_itemsSearchObj.runPaged().count;
				//log.debug("customrecord_da_pay_run_itemsSearchObj result count",searchResultCount);
				var deductionAmount = 0;
				customrecord_da_pay_run_itemsSearchObj.run().each(function(result) {
					var amount = result.getValue({
						name: 'custrecord_da_pay_run_item_amount'
					});
					deductionAmount = parseFloat(deductionAmount) + parseFloat(amount);
					deductionsObj["line" + k] = {
						'payrollitem': result.getText('custrecord_da_pay_run_paroll_items'),
						'dedlineamount': addZeroes(amount.toString())
					};
					k++;
					return true;
				});
				//log.debug('objj',JSON.stringify(deductionsObj) +""+JSON.stringify(earningsObj));
				var now = new Date(); // Say it's 7:01PM right now.
				var date = format.format({
					value: now,
					type: format.Type.DATE
				});
				var formattedTime = format.format({
					value: now,
					type: format.Type.DATETIMETZ
				});
				var totalNetPay = (parseFloat(basicsalary) + parseFloat(earningAmount)) - parseFloat(deductionAmount);
				var customrecord_emp_leave_balanceSearchObj = search.create({
					type: "customrecord_emp_leave_balance",
					filters: [
						["custrecord_employee_id", "anyof", empId]
					],
					columns: [
						search.createColumn({
							name: "custrecord_emp_leave_balance",
							label: "Leave Balance"
						})
					]
				});
				var searchResultCount = customrecord_emp_leave_balanceSearchObj.runPaged().count;
				//log.debug("customrecord_emp_leave_balanceSearchObj result count",searchResultCount);
				var leaveBalance = 0;
				customrecord_emp_leave_balanceSearchObj.run().each(function(result) {
					leaveBalance = result.getValue('custrecord_emp_leave_balance');
					return true;
				});
				var totalEarningAmount = (parseFloat(earningAmount) + parseFloat(basicsalary)).toString();
				var logourl = logourl.split('&');
				//log.debug('logourl', logourl);
				log.debug('to check',  numberWithCommas(addZeroes(totalNetPay.toString())));
				var objj = {
					'date': date,
					'dateandtime': formattedTime,
					'user': runtime.getCurrentUser().name,
					'basicsalary': numberWithCommas(addZeroes(basicsalary.toString())),
					'earningAmount': numberWithCommas(addZeroes(totalEarningAmount.toString())),
					'deductionAmount': numberWithCommas(addZeroes(deductionAmount.toString())),
					'totalNetPay': numberWithCommas(addZeroes(totalNetPay.toString())),
					'leaveBalance': leaveBalance,
					'totalinwords': convertNumberToWords(totalNetPay),
					"img_logo1": logourl[0],
					"img_logo2": logourl[1],
					"img_logo3": logourl[2],
                  'loanPayableAmount':numberWithCommas(addZeroes(loanPayableAmount.toString())),
                  'specialloanAmount':numberWithCommas(addZeroes(specialloanAmount.toString()))
				};
				log.debug('objj',objj);
				myTemplate.addCustomDataSource({
					format: render.DataSource.OBJECT,
					alias: "objj",
					data: objj
				});
				myTemplate.addCustomDataSource({
					format: render.DataSource.OBJECT,
					alias: "deductionsObj",
					data: deductionsObj
				});
				myTemplate.addCustomDataSource({
					format: render.DataSource.OBJECT,
					alias: "earningsObj",
					data: earningsObj
				});
				//log.debug('template', myTemplate);
				var template = myTemplate.renderAsPdf();
				//log.debug('template', template);
				template.name = periodName + "_" + empName + ".pdf";
				var folderSearchObj = search.create({
					type: "folder",
					filters: [
						["name", "contains", params.postingPeriodText]
					]
				});
				var folderId = -10;
				folderSearchObj.run().each(function(result) {
					folderId = result.id;
					return true;
				});
				//log.debug('folderId',folderId);
				template.folder = folderId;
				var id = template.save();
				//log.debug('id',id);
				if (id) {
					payslipRecord.setValue('custrecord_da_salary_slip_pdf', id);
					payslipRecord.save();
				}
				var fileObj = file.load({
					id: id
				});
				/*if (empEmail) {
					log.debug('email sending');
					email.send({
						author: -5,
						recipients: empId,
						subject: 'PaySlip For ' + periodName,
						body: 'Hi ' + empName + ', Please find the payslip PDF for the month :<b>' + periodName + '</b>',
						attachments: [fileObj]
					});
				}*/
				context.response.writeFile(template, true);
			} catch (ex) {
				log.error(ex.name, ex.message);
			}
		}

		function addZeroes(num) {
			var value = Number(num);
			var res = num.split(".");
			if (res.length == 1 || (res[1].length < 3)) {
				value = value.toFixed(2);
			}
			return value
		}
  
    function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

		function convertNumberToWords(s) {
			var th = ['', 'Thousand', 'Million', 'Billion', 'Trillion'];
			var dg = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
			var tn = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
			var tw = ['Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
			s = s.toString();
			s = s.replace(/[\, ]/g, '');
			if (s != parseFloat(s)) return 'not a number';
			var x = s.indexOf('.');
			if (x == -1)
				x = s.length;
			if (x > 15)
				return 'too big';
			var n = s.split('');
			var str = '';
			var sk = 0;
			for (var i = 0; i < x; i++) {
				if ((x - i) % 3 == 2) {
					if (n[i] == '1') {
						str += tn[Number(n[i + 1])] + ' ';
						i++;
						sk = 1;
					} else if (n[i] != 0) {
						str += tw[n[i] - 2] + ' ';
						sk = 1;
					}
				} else if (n[i] != 0) { // 0235
					str += dg[n[i]] + ' ';
					if ((x - i) % 3 == 0) str += 'hundred ';
					sk = 1;
				}
				if ((x - i) % 3 == 1) {
					if (sk)
						str += th[(x - i - 1) / 3] + ' ';
					sk = 0;
				}
			}
			if (x != s.length) {
				var y = s.length;
				str += 'point ';
				for (var i = x + 1; i < y; i++)
					str += dg[n[i]] + ' ';
			}
			return str.replace(/\s+/g, ' ');
		}
		return {
			onRequest: onRequest
		};
	});
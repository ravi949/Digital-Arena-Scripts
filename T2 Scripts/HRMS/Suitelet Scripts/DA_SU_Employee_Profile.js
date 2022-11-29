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
				log.debug('params', params);
				var myTemplate = render.create();
				// if(params.formid == '112'){
				myTemplate.setTemplateByScriptId({
					scriptId: "CUSTTMPL_EMP_PROFILE_TEMPLATE"
				});
				// }
				/*if(params.formid == '107'){
                 myTemplate.setTemplateByScriptId({
                    scriptId: "CUSTTMPL_CASH_PAYMENT_VOUCHER"
                });
               }*/
				var employeeRecord = record.load({
					type: 'employee',
					id: params.empId
				});
				var empBasicSalary = employeeRecord.getValue('custentity_da_emp_basic_salary');
				var employeeImage = employeeRecord.getValue('image');
				//log.debug('employeeImage',employeeImage);
				//
				var imgUrl1 = "";
				if (employeeImage) {
					var fileObj = file.load({
						id: employeeImage
					});
                  
                  var configRecObj = config.load({
						type: config.Type.COMPANY_INFORMATION
					});
					var accountId = configRecObj.getValue('companyid');
                    accountId = accountId.replace(/_/g, '-');
					var imgUrl = "";
					var origin = "https://" + accountId + ".app.netsuite.com"
					log.debug({
						details: "File URL: " + (fileObj.url).split(" ")
					});
                  var a =fileObj.url;
                  a.split(" ");
                  log.debug('a', a);
					var imgUrl = origin + "" + a;
					imgUrl1 = imgUrl;
					
				} else {
					var configRecObj = config.load({
						type: config.Type.COMPANY_INFORMATION
					});
					var accountId = configRecObj.getValue('companyid');
                    accountId = accountId.replace(/_/g, '-');
					var imgUrl = "";
					var origin = "https://" + accountId + ".app.netsuite.com";
					var companyLogo = configRecObj.getValue('pagelogo');
					if (companyLogo) {
						var fieldLookUpForUrl = search.lookupFields({
							type: 'file',
							id: companyLogo,
							columns: ['url']
						});
						log.debug('fieldLookUpurl', fieldLookUpForUrl.url);
						imgUrl1 = origin + "" + fieldLookUpForUrl.url;
					}
				}
              log.audit('new Log', imgUrl1);
				/*if (imgUrl1) {
					var imgUrlMatched = imgUrl.match('&');
					if (imgUrlMatched) {
						imgUrl1 = imgUrl1.replace(/&/g, "&amp;");
					}
				}*/
				log.debug('imgUrl', imgUrl1);
				myTemplate.addRecord('record', employeeRecord);
				var customrecord_da_emp_earningsSearchObj = search.create({
					type: "customrecord_da_emp_earnings",
					filters: [
						["custrecord_da_earnings_employee", "anyof", params.empId]
					],
					columns: [
						search.createColumn({
							name: "custrecord_da_earnings_payroll_item",
							label: "Payroll Item"
						}),
						search.createColumn({
							name: "custrecord_da_earnings_amount",
							label: "Amount"
						})
					]
				});
				var searchResultCount = customrecord_da_emp_earningsSearchObj.runPaged().count;
				log.debug("customrecord_da_emp_earningsSearchObj result count", searchResultCount);
				var earningsObj = {};
				var i = 1;
				var earningAmount = 0;
				customrecord_da_emp_earningsSearchObj.run().each(function(result) {
					var amount = result.getValue({
						name: 'custrecord_da_earnings_amount'
					});
					if (amount > 0) {
						earningAmount = parseFloat(earningAmount) + parseFloat(amount);
					}
					earningsObj["line" + i] = {
						'payrollitem': result.getText('custrecord_da_earnings_payroll_item'),
						'earnlineamount': addZeroes(amount.toString())
					};
					i++;
					return true;
				});
				var indObj = {};
				var j = 1;
				var customrecord_da_indemnity_reportSearchObj = search.create({
					type: "customrecord_da_indemnity_report",
					filters: [
						["custrecord_da_ind_employee", "anyof", params.empId]
					],
					columns: [
						search.createColumn({
							name: "created",
							sort: search.Sort.DESC,
							label: "Date Created"
						}),
						search.createColumn({
							name: "custrecord_da_ind_employee",
							label: "Employee"
						}),
						search.createColumn({
							name: "custrecord_da_ind_emp_subsidairy",
							label: "Subsidiary"
						}),
						search.createColumn({
							name: "custrecord_da_ind_emp_hire_date",
							label: "Hire Date"
						}),
						search.createColumn({
							name: "custrecord_da_ind_working_years",
							label: "Working Years"
						}),
						search.createColumn({
							name: "custrecord_da_salary_eligible_for_indem",
							label: "Salary Eligible for Indemnity"
						}),
						search.createColumn({
							name: "custrecord_da_ind_opening_balance",
							label: "Opening Balance"
						}),
						search.createColumn({
							name: "custrecord_da_ind_adding_amount",
							label: "Additional Amount"
						}),
						search.createColumn({
							name: "custrecord_da_ind_final_amount",
							label: "Final Amount"
						})
					]
				});
				var searchResultCount = customrecord_da_indemnity_reportSearchObj.runPaged().count;
				//log.debug("customrecord_da_indemnity_reportSearchObj result count",searchResultCount);
				customrecord_da_indemnity_reportSearchObj.run().each(function(result) {
					indObj["line" + j] = {
						'salary': empBasicSalary,
						'workingyears': result.getValue('custrecord_da_ind_working_years'),
						'finalamount': result.getValue('custrecord_da_ind_final_amount')
					};
					//i++;
				});
				/*	var deductionsObj = {};var k =1;
					var customrecord_da_pay_run_itemsSearchObj = search.create({
						type: "customrecord_da_pay_run_items",
						filters:
							[
								["custrecord_da_pay_run_employee","anyof",empId], 
								"AND", 
								["custrecord_da_pay_run_scheduling.custrecord_da_sch_pay_run_period","anyof",periodId], 
								"AND", 
								["custrecord_da_pay_run_item_type","anyof","2"]
								],
								columns:
									[
										'custrecord_da_pay_run_item_amount','custrecord_da_pay_run_paroll_items'
										]
					});
					var searchResultCount = customrecord_da_pay_run_itemsSearchObj.runPaged().count;
					log.debug("customrecord_da_pay_run_itemsSearchObj result count",searchResultCount);

					var deductionAmount = 0;
					customrecord_da_pay_run_itemsSearchObj.run().each(function(result){


						var amount  = result.getValue({name:'custrecord_da_pay_run_item_amount'});

						deductionAmount = parseFloat(deductionAmount) + parseFloat(amount);

						deductionsObj["line"+k] = {
								'payrollitem':result.getText('custrecord_da_pay_run_paroll_items'),
								'dedlineamount':addZeroes(amount.toString())
						};
						k++;

						return true;
					});*/
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
				var totalNetPay = (parseFloat(empBasicSalary) + parseFloat(earningAmount)) - parseFloat(0);
				var customrecord_emp_leave_balanceSearchObj = search.create({
					type: "customrecord_emp_leave_balance",
					filters: [
						["custrecord_employee_id", "anyof", params.empId]
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
				var totalEarningAmount = (parseFloat(earningAmount) + parseFloat(empBasicSalary)).toString();
				log.debug('imgUrl', imgUrl1);
				imgUrl1 = imgUrl1.split("&");
				var objj = {
					'date': date,
					'dateandtime': formattedTime,
					'user': runtime.getCurrentUser().name,
					'basicsalary': addZeroes(empBasicSalary.toString()),
					'earningAmount': addZeroes(totalEarningAmount),
					//'deductionAmount':addZeroes(deductionAmount.toString()),
					'totalNetPay': addZeroes(totalNetPay.toString()),
					'leaveBalance': leaveBalance,
					'totalinwords': convertNumberToWords(totalNetPay),
					"img_logo1": imgUrl1[0],
					"imgUrl": imgUrl,
					"img_logo2": imgUrl1[1],
					"img_logo3": imgUrl1[2]
				};
				log.debug('objj', objj);
				myTemplate.addCustomDataSource({
					format: render.DataSource.OBJECT,
					alias: "objj",
					data: objj
				});
				/*myTemplate.addCustomDataSource({
					format: render.DataSource.OBJECT,
					alias: "deductionsObj",
					data: deductionsObj
				});*/
				myTemplate.addCustomDataSource({
					format: render.DataSource.OBJECT,
					alias: "earningsObj",
					data: earningsObj
				});
				myTemplate.addCustomDataSource({
					format: render.DataSource.OBJECT,
					alias: "indObj",
					data: indObj
				});
				log.debug('template', myTemplate);
				var template = myTemplate.renderAsPdf();
				log.debug('template', template);
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
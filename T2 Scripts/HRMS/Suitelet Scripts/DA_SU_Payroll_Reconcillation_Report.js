/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope TargetAccount
 */
define(['N/render', 'N/record', 'N/file', 'N/search', 'N/format', 'N/runtime','N/config'],
	function(render, record, file, search, format, runtime,config) {
		/**
		 * Definition of the Suitelet script trigger point.
		 * 
		 * @param {Object}
		 *            context
		 * @param {ServerRequest}
		 *            context.request - Encapsulation of the incoming request
		 * @param {ServerResponse}
		 *            context.response - Encapsulation of the Suitelet response
		 * @Since 2015.2
		 */
		function onRequest(context) {
			try {
				var params = context.request.parameters;
				log.debug('params', params);
				var myTemplate = render.create();
				myTemplate.setTemplateByScriptId({
					scriptId: "CUSTTMPL_DA_PAYROLL_REC_REPORT"
				});

				//logo

				var configRecObj = config.load({
					type: config.Type.COMPANY_INFORMATION
				});
				var accountId = configRecObj.getValue('companyid');
				accountId = accountId.replace(/_/g, '-');
				log.debug(accountId);
				var logourl = "";
				var origin = "https://" + accountId + ".app.netsuite.com";
				
				var objRec = record.load({
					type: 'customrecord_da_payroll_reconcillation',
					id: params.recID
				});
				myTemplate.addRecord('record', objRec);
				var currentPeriod = params.currentPeriod
				var comparePeriod = params.comparePeriod;
				var date = new Date();
				var kuwait = format.format({
					value: date,
					type: format.Type.DATETIME,
					timezone: format.Timezone.ASIA_RIYADH
				});
				var objj = {
					"date": kuwait
				};
				var reportArr = [];
				var customrecord_da_payroll_itemsSearchObj = search.create({
					type: "customrecord_da_payroll_items",
					filters: [],
					columns: [
						search.createColumn({
							name: "internalid",
							label: "Internal ID"
						}),
						search.createColumn({
							name: "name",
							sort: search.Sort.ASC,
							label: "Name"
						})
					]
				});
				var featureEnabled = runtime.isFeatureInEffect({
					feature: 'SUBSIDIARIES'
				});
				log.debug(featureEnabled);
				if (featureEnabled) {
					var subsidiaryId = params.subsidiary;
					customrecord_da_payroll_itemsSearchObj.filters.push(search.createFilter({
						"name": "custrecord_da_payroll_item_subsidiary",
						"operator": "anyof",
						"values": subsidiaryId
					}));


					//var subsidiaryId = payslipRecord.getValue('custrecord_emp_subsidiary');
					var subsidiaryRecord = record.load({
						type: 'subsidiary',
						id: subsidiaryId
					});
					log.debug(subsidiaryRecord.getValue('logo'));
					if (subsidiaryRecord.getValue('logo')) {
						var fieldLookUpForUrl = search.lookupFields({
							type: 'file',
							id: subsidiaryRecord.getValue('logo'),
							columns: ['url']
						});
						log.debug('fieldLookUpurl', fieldLookUpForUrl.url);
						logourl = origin + "" + fieldLookUpForUrl.url;
					}
				}else{
					var companyLogo = configRecObj.getValue('pagelogo');
					if (companyLogo) {
						var fieldLookUpForUrl = search.lookupFields({
							type: 'file',
							id: companyLogo,
							columns: ['url']
						});
						log.debug('fieldLookUpurl', fieldLookUpForUrl.url);
						logourl = origin + "" + fieldLookUpForUrl.url;
					}
				}
				var searchResultCount = customrecord_da_payroll_itemsSearchObj.runPaged().count;
				log.debug("customrecord_da_payroll_itemsSearchObj result count", searchResultCount);
				var totalCurrentAmount = 0,
					totalCompareAmount = 0;
				customrecord_da_payroll_itemsSearchObj.run().each(function(result) {
					var customrecord_da_pay_run_itemsSearchObj = search.create({
						type: "customrecord_da_pay_run_items",
						filters: [
							["custrecord_da_pay_run_scheduling.custrecord_da_sch_pay_run_period", "anyof", currentPeriod],
							"AND",
							["custrecord_da_pay_run_paroll_items", "anyof", result.id]
						],
						columns: [
							search.createColumn({
								name: "custrecord_da_pay_run_paroll_items",
								summary: "GROUP",
								label: "Payroll Item"
							}),
							search.createColumn({
								name: "custrecord_da_pay_run_item_amount",
								summary: "SUM",
								label: "Amount"
							})
						]
					});
					var currentAmount = 0;
					customrecord_da_pay_run_itemsSearchObj.run().each(function(result) {
						currentAmount = result.getValue({
							name: 'custrecord_da_pay_run_item_amount',
							summary: search.Summary.SUM
						});
						return true;
					});
					var customrecord_da_pay_run_itemsSearchObj = search.create({
						type: "customrecord_da_pay_run_items",
						filters: [
							["custrecord_da_pay_run_scheduling.custrecord_da_sch_pay_run_period", "anyof", comparePeriod],
							"AND",
							["custrecord_da_pay_run_paroll_items", "anyof", result.id]
						],
						columns: [
							search.createColumn({
								name: "custrecord_da_pay_run_paroll_items",
								summary: "GROUP",
								label: "Payroll Item"
							}),
							search.createColumn({
								name: "custrecord_da_pay_run_item_amount",
								summary: "SUM",
								label: "Amount"
							})
						]
					});
					var compareAmount = 0;
					customrecord_da_pay_run_itemsSearchObj.run().each(function(result) {
						compareAmount = result.getValue({
							name: 'custrecord_da_pay_run_item_amount',
							summary: search.Summary.SUM
						});
						return true;
					});
					reportArr.push({
						'payrollItem': result.getValue('name'),
						'currentAmount': addZeroes(currentAmount.toString()),
						'compareAmount': addZeroes(compareAmount.toString())
					});
					return true;
				});
				var reportObj = {
					'reportArr': reportArr
				};
				var customrecord_da_pay_run_schedulingSearchObj = search.create({
					type: "customrecord_da_pay_run_scheduling",
					filters: [
						["custrecord_da_sch_pay_run_period", "anyof", currentPeriod]
					],
					columns: [
						search.createColumn({
							name: "custrecord_payrun_total_amount",
							label: "Total Amount"
						})
					]
				});
				var searchResultCount = customrecord_da_pay_run_schedulingSearchObj.runPaged().count;
				log.debug("customrecord_da_pay_run_schedulingSearchObj result count", searchResultCount);
				customrecord_da_pay_run_schedulingSearchObj.run().each(function(result) {
					totalCurrentAmount = result.getValue('custrecord_payrun_total_amount');
					return true;
				});
				var customrecord_da_pay_run_schedulingSearchObj = search.create({
					type: "customrecord_da_pay_run_scheduling",
					filters: [
						["custrecord_da_sch_pay_run_period", "anyof", comparePeriod]
					],
					columns: [
						search.createColumn({
							name: "custrecord_payrun_total_amount",
							label: "Total Amount"
						})
					]
				});
				var searchResultCount = customrecord_da_pay_run_schedulingSearchObj.runPaged().count;
				log.debug("customrecord_da_pay_run_schedulingSearchObj result count", searchResultCount);
				customrecord_da_pay_run_schedulingSearchObj.run().each(function(result) {
					totalCompareAmount = result.getValue('custrecord_payrun_total_amount');
					return true;
				});

				var logourl = logourl.split('&');
				var obj = {
					'totalCompareAmount': totalCompareAmount,
					'totalCurrentAmount': totalCurrentAmount,
					"img_logo1": logourl[0],
					"img_logo2": logourl[1],
					"img_logo3": logourl[2],
				}
				log.debug('totalObj', obj);
				myTemplate.addCustomDataSource({
					format: render.DataSource.OBJECT,
					alias: "objj",
					data: reportObj
				});
				myTemplate.addCustomDataSource({
					format: render.DataSource.OBJECT,
					alias: "obj",
					data: obj
				});
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
		return {
			onRequest: onRequest
		};
	});
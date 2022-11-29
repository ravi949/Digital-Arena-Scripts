/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/url', 'N/https'],
	function(search, url, https) {
		/**
		 * Function to be executed after page is initialized.
		 *
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.currentRecord - Current form record
		 * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
		 *
		 * @since 2015.2
		 */
		var mode, subsidiaryExists = false;

		function pageInit(scriptContext) {
			mode = scriptContext.mode;
			var subsidiaryExistsUrl = url.resolveScript({
				scriptId: 'customscript_da_su_subsidiary_checking',
				deploymentId: 'customdeploy_da_su_subsidiary_checking',
				returnExternalUrl: false
			});
			log.debug('subsidiaryExists', subsidiaryExistsUrl);
			var response = https.get({
				url: subsidiaryExistsUrl
			});
			console.log(response);
			console.log(JSON.parse(response.body).subsidairiesExists);
			if (JSON.parse(response.body).subsidairiesExists) {
				subsidiaryExists = true;
			}
		}
		/**
		 * Function to be executed when field is changed.
		 *
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.currentRecord - Current form record
		 * @param {string} scriptContext.sublistId - Sublist name
		 * @param {string} scriptContext.fieldId - Field name
		 * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
		 * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
		 *
		 * @since 2015.2
		 */
		function fieldChanged(scriptContext) {
			try {
			} catch (ex) {
				console.log(ex.name, ex.message);
			}
		}

		function generatereport(id) {
			//var suiteletUrl = url.resolveScript({
			//		scriptId:'customscript_da_su_payrun_report',
			//		deploymentId:'customdeploy_da_su_payrun_report',
			//		params:{cmid:id,submit:'false'}
			//	});
			var output = url.resolveScript({
				scriptId: 'customscript_da_su_payrun_report',
				deploymentId: 'customdeploy_da_su_payrun_report',
				returnExternalUrl: false,
				params: {
					transId: id
				}
			});
			console.log(output);
			window.open(window.location.origin + '' + output, '_blank');
			// console.log(suiteletUrl);
			//window.open(output);
			//return true;
		}

		function generatesummaryreport(id) {
			console.log(id);
			var payrunitemsSearch = search.load({
				id: 'customsearch_d_payrun_search_scripting'
			});
			payrunitemsSearch.filters.pop({
				"name": "custrecord_da_pay_run_scheduling"
			});
			payrunitemsSearch.filters.push(search.createFilter({
				"name": "custrecord_da_pay_run_scheduling",
				"operator": "anyof",
				"values": id
			}));
			payrunitemsSearch.columns.splice(1, 0, search.createColumn({
				"name": "custrecord_da_pay_run_paroll_items"
			}));
			payrunitemsSearch.columns.splice(2, 0, search.createColumn({
				"name": "custrecord_da_payroll_item_type"
			}));
			var searchId = payrunitemsSearch.save();
			console.log(searchId);
			var URL = window.location.origin + '/app/common/search/searchresults.nl?searchid=' + searchId + '&saverun=T&whence=';
			console.log(URL);
			window.open(URL, '_blank');
		}
		/**
		 * Function to be executed when field is slaved.
		 *
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.currentRecord - Current form record
		 * @param {string} scriptContext.sublistId - Sublist name
		 * @param {string} scriptContext.fieldId - Field name
		 *
		 * @since 2015.2
		 */
		function postSourcing(scriptContext) {}
		/**
		 * Function to be executed after sublist is inserted, removed, or edited.
		 *
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.currentRecord - Current form record
		 * @param {string} scriptContext.sublistId - Sublist name
		 *
		 * @since 2015.2
		 */
		function sublistChanged(scriptContext) {}
		/**
		 * Function to be executed after line is selected.
		 *
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.currentRecord - Current form record
		 * @param {string} scriptContext.sublistId - Sublist name
		 *
		 * @since 2015.2
		 */
		function lineInit(scriptContext) {}
		/**
		 * Validation function to be executed when field is changed.
		 *
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.currentRecord - Current form record
		 * @param {string} scriptContext.sublistId - Sublist name
		 * @param {string} scriptContext.fieldId - Field name
		 * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
		 * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
		 *
		 * @returns {boolean} Return true if field is valid
		 *
		 * @since 2015.2
		 */
		function validateField(scriptContext) {}
		/**
		 * Validation function to be executed when sublist line is committed.
		 *
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.currentRecord - Current form record
		 * @param {string} scriptContext.sublistId - Sublist name
		 *
		 * @returns {boolean} Return true if sublist line is valid
		 *
		 * @since 2015.2
		 */
		function validateLine(scriptContext) {}
		/**
		 * Validation function to be executed when sublist line is inserted.
		 *
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.currentRecord - Current form record
		 * @param {string} scriptContext.sublistId - Sublist name
		 *
		 * @returns {boolean} Return true if sublist line is valid
		 *
		 * @since 2015.2
		 */
		function validateInsert(scriptContext) {}
		/**
		 * Validation function to be executed when record is deleted.
		 *
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.currentRecord - Current form record
		 * @param {string} scriptContext.sublistId - Sublist name
		 *
		 * @returns {boolean} Return true if sublist line is valid
		 *
		 * @since 2015.2
		 */
		function validateDelete(scriptContext) {}
		/**
		 * Validation function to be executed when record is saved.
		 *
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.currentRecord - Current form record
		 * @returns {boolean} Return true if record is valid
		 *
		 * @since 2015.2
		 */
		function saveRecord(scriptContext) {
			try {
				var date = scriptContext.currentRecord.getText('custrecord_da_sch_pay_run_date');
				console.log('date' + date);
				var monthfull = date.split("/");
				var month_month = monthfull[1];
				var month_year = monthfull[2];
				var monthsobj = {
					'01': 'Jan',
					'02': 'Feb',
					'03': 'Mar',
					'04': 'Apr',
					'05': 'May',
					'06': 'Jun',
					'07': 'Jul',
					'08': 'Aug',
					'09': 'Sep',
					'10': 'Oct',
					'11': 'Nov',
					'12': 'Dec'
				}
				var paymonth = monthsobj[month_month];
				var monthPeriod = paymonth + " " + month_year;
				console.log(monthPeriod);
				var postingperiodText = scriptContext.currentRecord.getText('custrecord_da_sch_pay_run_period');
				var payrunperiod = postingperiodText.trim();
				var postingperiodId = scriptContext.currentRecord.getValue('custrecord_da_sch_pay_run_period');
				if (monthPeriod != payrunperiod) {
					alert("The transaction date you specified is not within the date range of your accounting period.");
					return false;
				}
				
				//search existed payrun schedule records
				var customrecord_da_pay_run_schedulingSearchObj = search.create({
					type: "customrecord_da_pay_run_scheduling",
					filters: [
						["custrecord_da_sch_pay_run_period", "anyof", postingperiodId]
					],
					columns: [
						search.createColumn({
							name: "id",
							sort: search.Sort.ASC,
							label: "ID"
						})
					]
				});

				if(subsidiaryExists){
					var subsisidary = scriptContext.currentRecord.getValue('custrecord_da_payroll_subsidiary');
					customrecord_da_pay_run_schedulingSearchObj.filters.push(search.createFilter({
        			"name"    : "custrecord_da_payroll_subsidiary",
        			"operator": "anyof",
        			"values"  : subsisidary
        			}));
				}
				var searchResultCount = customrecord_da_pay_run_schedulingSearchObj.runPaged().count;
				console.log("customrecord_da_pay_run_schedulingSearchObj result count", searchResultCount);
				if (searchResultCount > 0 && mode == 'create') {
					console.log('alert');
					alert('Already there is existed payrun record with the same posting period');
					return true;
				}
				return true;
			} catch (ex) {
				console.log(ex.name, ex.message);
			}
		}
		return {
			pageInit: pageInit,
			//fieldChanged: fieldChanged,
			//		postSourcing: postSourcing,
			//		sublistChanged: sublistChanged,
			//		lineInit: lineInit,
			//		validateField: validateField,
			//		validateLine: validateLine,
			//		validateInsert: validateInsert,
			//		validateDelete: validateDelete,
			saveRecord: saveRecord,
			generatereport: generatereport,
			generatesummaryreport: generatesummaryreport
		};
	});
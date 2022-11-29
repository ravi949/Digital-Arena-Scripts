/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search', 'N/url', 'N/currentRecord'],
	/**
	 * @param {record}
	 *            record
	 * @param {search}
	 *            search
	 */
	function(record, search, url, currentRecord) {
		/**
		 * Function to be executed after page is initialized.
		 * 
		 * @param {Object}
		 *            scriptContext
		 * @param {Record}
		 *            scriptContext.currentRecord - Current form record
		 * @param {string}
		 *            scriptContext.mode - The mode in which the record is
		 *            being accessed (create, copy, or edit)
		 * 
		 * @since 2015.2
		 */
		var context, beauticianIdEntry, subjectIdEntry;

		function pageInit(context) {
			var url_string = window.location.href;
			console.log(url_string);
			var url1 = new URL(url_string);
			var batchId = url1.searchParams.get("batchId");
			if (batchId) {
				//var batchId = context.currentRecord.getValue('custpage_batch');
				var customrecord_da_amm_batch_subjectsSearchObj = search.create({
					type: "customrecord_da_amm_batch_subjects",
					filters: [
						["custrecord_da_amm_batch_parent", "anyof", batchId]
					],
					columns: [
						search.createColumn({
							name: "custrecord_da_amm_beauitician_name",
							summary: "GROUP",
							label: "Beautician Name"
						})
					]
				});
				var searchResultCount = customrecord_da_amm_batch_subjectsSearchObj.runPaged().count;
				log.debug("customrecord_da_amm_batch_subjectsSearchObj result count", searchResultCount);
				var field = context.currentRecord.getField({
					fieldId: 'custpage_beautician'
				});
				customrecord_da_amm_batch_subjectsSearchObj.run().each(function(result) {
					field.insertSelectOption({
						value: result.getValue({
							name: 'custrecord_da_amm_beauitician_name',
							summary: search.Summary.GROUP
						}),
						text: result.getText({
							name: 'custrecord_da_amm_beauitician_name',
							summary: search.Summary.GROUP
						})
					});
					return true;
				});
			}
			beauticianIdEntry = url1.searchParams.get("BeauticianId");			
			if (beauticianIdEntry) {
				context.currentRecord.setValue('custpage_beautician', beauticianIdEntry);
				var batchId = context.currentRecord.getValue('custpage_batch');
				//var BeauticianId = context.currentRecord.getValue('custpage_beautician');
				var customrecord_da_amm_batch_subjectsSearchObj = search.create({
					type: "customrecord_da_amm_batch_subjects",
					filters: [
						["custrecord_da_amm_batch_parent", "anyof", batchId],
						"AND",
						["custrecord_da_amm_beauitician_name", "anyof", beauticianIdEntry]
					],
					columns: [
						search.createColumn({
							name: "custrecord_da_amm_subject_name",
							label: "Subject Name"
						})
					]
				});
				var searchResultCount = customrecord_da_amm_batch_subjectsSearchObj.runPaged().count;
				log.debug("customrecord_da_amm_batch_subjectsSearchObj result count", searchResultCount);
				var field = context.currentRecord.getField({
					fieldId: 'custpage_subject'
				});
				field.removeSelectOption({
				    value: null,
				}); 
				field.insertSelectOption({
						value: ' ',
						text: ' '
				})
				
				customrecord_da_amm_batch_subjectsSearchObj.run().each(function(result) {
					field.insertSelectOption({
						value: result.getValue({
							name: 'custrecord_da_amm_subject_name'
						}),
						text: result.getText({
							name: 'custrecord_da_amm_subject_name'
						})
					});
					return true;
				});
			}

			subjectIdEntry = url1.searchParams.get("subjectId");
			if(subjectIdEntry){
				context.currentRecord.setValue('custpage_subject', subjectIdEntry);
			}
		}
		/**
		 * Function to be executed when field is changed.
		 * 
		 * @param {Object}
		 *            scriptContext
		 * @param {Record}
		 *            scriptContext.currentRecord - Current form record
		 * @param {string}
		 *            scriptContext.sublistId - Sublist name
		 * @param {string}
		 *            scriptContext.fieldId - Field name
		 * @param {number}
		 *            scriptContext.lineNum - Line number. Will be undefined
		 *            if not a sublist or matrix field
		 * @param {number}
		 *            scriptContext.columnNum - Line number. Will be
		 *            undefined if not a matrix field
		 * 
		 * @since 2015.2
		 */
		function fieldChanged(context) {
			try {
				if (context.fieldId == 'custpage_batch' || context.fieldId == 'custpage_ss_start_date') {
					var beauticianId = context.currentRecord.getValue('custpage_beautician');
					var subjectId = context.currentRecord.getValue('custpage_subject');
					var batchId = context.currentRecord.getValue('custpage_batch');
					var date = context.currentRecord.getValue('custpage_ss_start_date');
					var trigger = true;	

					
					console.log("3rd"+trigger);
					
					if (trigger) {
						var output = url.resolveScript({
							scriptId: 'customscript_da_su_batch_attendance',
							deploymentId: 'customdeploy_da_su_batch_attendance',
							returnExternalUrl: false,
							params: {
								subjectId: subjectId,
								batchId: batchId,
								BeauticianId: beauticianId,
								dateText: context.currentRecord.getText('custpage_ss_start_date')
							}
						});
						if (window.onbeforeunload) {
							window.onbeforeunload = function() {
								null;
							};
						};
						console.log(output);
						window.open(window.location.origin + '' + output, '_self');
					}
					
				}

				if(context.fieldId == 'custpage_beautician'){

					var beauticianId = context.currentRecord.getValue('custpage_beautician');
					var subjectId = context.currentRecord.getValue('custpage_subject');
					var batchId = context.currentRecord.getValue('custpage_batch');
					var date = context.currentRecord.getValue('custpage_ss_start_date');
					var trigger = true;	

					if(beauticianIdEntry == null || beauticianIdEntry == undefined){
						trigger = true;
					}

					console.log("first"+trigger);
					
					console.log("second"+trigger);
					if(beauticianIdEntry) {
						if(beauticianIdEntry == beauticianId){
							trigger = false;
						}						
					}

					if (trigger) {
						var output = url.resolveScript({
							scriptId: 'customscript_da_su_batch_attendance',
							deploymentId: 'customdeploy_da_su_batch_attendance',
							returnExternalUrl: false,
							params: {
								subjectId: subjectId,
								batchId: batchId,
								BeauticianId: beauticianId,
								dateText: context.currentRecord.getText('custpage_ss_start_date')
							}
						});
						if (window.onbeforeunload) {
							window.onbeforeunload = function() {
								null;
							};
						};
						console.log(output);
						window.open(window.location.origin + '' + output, '_self');
					}
				}



				if(context.fieldId == 'custpage_subject'){

					var beauticianId = context.currentRecord.getValue('custpage_beautician');
					var subjectId = context.currentRecord.getValue('custpage_subject');
					var batchId = context.currentRecord.getValue('custpage_batch');
					var date = context.currentRecord.getValue('custpage_ss_start_date');
					var trigger = true;	

					if(subjectIdEntry) {
						if(subjectIdEntry == subjectId){
							trigger = false;
						}						
					}

					if (trigger) {
						var output = url.resolveScript({
							scriptId: 'customscript_da_su_batch_attendance',
							deploymentId: 'customdeploy_da_su_batch_attendance',
							returnExternalUrl: false,
							params: {
								subjectId: subjectId,
								batchId: batchId,
								BeauticianId: beauticianId,
								dateText: context.currentRecord.getText('custpage_ss_start_date')
							}
						});
						if (window.onbeforeunload) {
							window.onbeforeunload = function() {
								null;
							};
						};
						console.log(output);
						window.open(window.location.origin + '' + output, '_self');
					}
				}
				if (context.fieldId == 'custpage_batch') {
					var batchId = context.currentRecord.getValue('custpage_batch');
					var customrecord_da_amm_batch_subjectsSearchObj = search.create({
						type: "customrecord_da_amm_batch_subjects",
						filters: [
							["custrecord_da_amm_batch_parent", "anyof", batchId]
						],
						columns: [
							search.createColumn({
								name: "custrecord_da_amm_beauitician_name",
								summary: "GROUP",
								label: "Beautician Name"
							})
						]
					});
					var searchResultCount = customrecord_da_amm_batch_subjectsSearchObj.runPaged().count;
					log.debug("customrecord_da_amm_batch_subjectsSearchObj result count", searchResultCount);
					var field = context.currentRecord.getField({
						fieldId: 'custpage_beautician'
					});
					customrecord_da_amm_batch_subjectsSearchObj.run().each(function(result) {
						field.insertSelectOption({
							value: result.getValue({
								name: 'custrecord_da_amm_beauitician_name',
								summary: search.Summary.GROUP
							}),
							text: result.getText({
								name: 'custrecord_da_amm_beauitician_name',
								summary: search.Summary.GROUP
							})
						});
						return true;
					});
				}
				if (context.fieldId == 'custpage_beautician') {
					var batchId = context.currentRecord.getValue('custpage_batch');
					var BeauticianId = context.currentRecord.getValue('custpage_beautician');
					var customrecord_da_amm_batch_subjectsSearchObj = search.create({
						type: "customrecord_da_amm_batch_subjects",
						filters: [
							["custrecord_da_amm_batch_parent", "anyof", batchId],
							"AND",
							["custrecord_da_amm_beauitician_name", "anyof", BeauticianId]
						],
						columns: [
							search.createColumn({
								name: "custrecord_da_amm_subject_name",
								label: "Subject Name"
							})
						]
					});
					var searchResultCount = customrecord_da_amm_batch_subjectsSearchObj.runPaged().count;
					console.log("customrecord_da_amm_batch_subjectsSearchObj result count", searchResultCount);
					var field = context.currentRecord.getField({
						fieldId: 'custpage_subject'
					});
					customrecord_da_amm_batch_subjectsSearchObj.run().each(function(result) {
						field.insertSelectOption({
							value: result.getValue({
								name: 'custrecord_da_amm_subject_name'
							}),
							text: result.getText({
								name: 'custrecord_da_amm_subject_name'
							})
						});
						return true;
					});
				}
			} catch (ex) {
				console.log(ex.name, ex.message);
			}
		}

		function markAll() {
			var objRecord = currentRecord.get();
			//console.log(objRecord);
			var numLines = objRecord.getLineCount({
				sublistId: 'custpage_report_sublist'
			});
			//console.log(numLines);
			for (var i = 0; i < numLines; i++) {
				var record = objRecord.selectLine({
					sublistId: 'custpage_report_sublist',
					line: i
				});
				objRecord.setCurrentSublistValue({
					sublistId: 'custpage_report_sublist',
					fieldId: 'custpage_attended',
					line: i,
					value: true
				});
			}
		}

		function unmarkAll() {
			var objRecord = currentRecord.get();
			//console.log(objRecord);
			var numLines = objRecord.getLineCount({
				sublistId: 'custpage_report_sublist'
			});
			console.log(numLines);
			for (var i = 0; i < numLines; i++) {
				var record = objRecord.selectLine({
					sublistId: 'custpage_report_sublist',
					line: i
				});
				objRecord.setCurrentSublistValue({
					sublistId: 'custpage_report_sublist',
					fieldId: 'custpage_attended',
					line: i,
					value: false
				});
			}
		}
		/**
		 * Function to be executed when field is slaved.
		 * 
		 * @param {Object}
		 *            scriptContext
		 * @param {Record}
		 *            scriptContext.currentRecord - Current form record
		 * @param {string}
		 *            scriptContext.sublistId - Sublist name
		 * @param {string}
		 *            scriptContext.fieldId - Field name
		 * 
		 * @since 2015.2
		 */
		function postSourcing(scriptContext) {}
		/**
		 * Function to be executed after sublist is inserted, removed, or
		 * edited.
		 * 
		 * @param {Object}
		 *            scriptContext
		 * @param {Record}
		 *            scriptContext.currentRecord - Current form record
		 * @param {string}
		 *            scriptContext.sublistId - Sublist name
		 * 
		 * @since 2015.2
		 */
		function sublistChanged(scriptContext) {}
		/**
		 * Function to be executed after line is selected.
		 * 
		 * @param {Object}
		 *            scriptContext
		 * @param {Record}
		 *            scriptContext.currentRecord - Current form record
		 * @param {string}
		 *            scriptContext.sublistId - Sublist name
		 * 
		 * @since 2015.2
		 */
		function lineInit(scriptContext) {}
		/**
		 * Validation function to be executed when field is changed.
		 * 
		 * @param {Object}
		 *            scriptContext
		 * @param {Record}
		 *            scriptContext.currentRecord - Current form record
		 * @param {string}
		 *            scriptContext.sublistId - Sublist name
		 * @param {string}
		 *            scriptContext.fieldId - Field name
		 * @param {number}
		 *            scriptContext.lineNum - Line number. Will be undefined
		 *            if not a sublist or matrix field
		 * @param {number}
		 *            scriptContext.columnNum - Line number. Will be
		 *            undefined if not a matrix field
		 * 
		 * @returns {boolean} Return true if field is valid
		 * 
		 * @since 2015.2
		 */
		function validateField(scriptContext) {}
		/**
		 * Validation function to be executed when sublist line is
		 * committed.
		 * 
		 * @param {Object}
		 *            scriptContext
		 * @param {Record}
		 *            scriptContext.currentRecord - Current form record
		 * @param {string}
		 *            scriptContext.sublistId - Sublist name
		 * 
		 * @returns {boolean} Return true if sublist line is valid
		 * 
		 * @since 2015.2
		 */
		function validateLine(scriptContext) {}
		/**
		 * Validation function to be executed when sublist line is inserted.
		 * 
		 * @param {Object}
		 *            scriptContext
		 * @param {Record}
		 *            scriptContext.currentRecord - Current form record
		 * @param {string}
		 *            scriptContext.sublistId - Sublist name
		 * 
		 * @returns {boolean} Return true if sublist line is valid
		 * 
		 * @since 2015.2
		 */
		function validateInsert(scriptContext) {}
		/**
		 * Validation function to be executed when record is deleted.
		 * 
		 * @param {Object}
		 *            scriptContext
		 * @param {Record}
		 *            scriptContext.currentRecord - Current form record
		 * @param {string}
		 *            scriptContext.sublistId - Sublist name
		 * 
		 * @returns {boolean} Return true if sublist line is valid
		 * 
		 * @since 2015.2
		 */
		function validateDelete(scriptContext) {}
		/**
		 * Validation function to be executed when record is saved.
		 * 
		 * @param {Object}
		 *            scriptContext
		 * @param {Record}
		 *            scriptContext.currentRecord - Current form record
		 * @returns {boolean} Return true if record is valid
		 * 
		 * @since 2015.2
		 */
		function saveRecord(context) {}
		return {
			pageInit: pageInit,
			fieldChanged: fieldChanged,
			// postSourcing: postSourcing,
			// sublistChanged: sublistChanged,
			// lineInit : lineInit,
			// validateField: validateField,
			// validateLine: validateLine,
			// validateInsert: validateInsert,
			// validateDelete: validateDelete,
			// saveRecord: saveRecord,
			markAll: markAll,
			unmarkAll: unmarkAll
		};
	});
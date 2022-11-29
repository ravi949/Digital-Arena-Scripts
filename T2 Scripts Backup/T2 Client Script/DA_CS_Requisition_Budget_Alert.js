/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope TargetAccount
 */
define(['N/currentRecord','N/search','N/record','N/url','N/email'],

		function(currentRecord,search,record,url,email) {

	/**
	 * Function to be executed after page is initialized.
	 *
	 * @param {Object} scriptContext
	 * @param {Record} scriptContext.currentRecord - Current form record
	 * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
	 *
	 * @since 2015.2
	 */
	var sc;
	var mode;
	function pageInit(scriptContext) {
		console.log("Script triggered");

		mode = scriptContext.mode;
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
		try{
          
          if(scriptContext.sublistId =='expense' && scriptContext.fieldId == 'account'){
            console.log(true);
             var account = scriptContext.currentRecord.getCurrentSublistValue({
							    sublistId: 'expense',
							    fieldId: 'account'
							});
            var department = scriptContext.currentRecord.getValue('department');
            var classId = scriptContext.currentRecord.getValue('class');
            if(account){
              if(department){
                 scriptContext.currentRecord.setCurrentSublistValue({
							    sublistId: 'expense',
							    fieldId: 'department',
                   value:department
							});
              }
               if(classId){
                 scriptContext.currentRecord.setCurrentSublistValue({
							    sublistId: 'expense',
							    fieldId: 'class',
                   value:classId
							});
              }
            }
             }
			if(scriptContext.fieldId == 'custpage_department' || scriptContext.fieldId == 'custpage_class' || scriptContext.fieldId == 'custpage_item'){
				var department = scriptContext.currentRecord.getValue('custpage_department');
				var recordClass = scriptContext.currentRecord.getValue('custpage_class');
                var itemId = scriptContext.currentRecord.getValue('custpage_item');
				var suiteletUrl = url.resolveScript({
					scriptId: 'customscript_da_su_budget_report',
					deploymentId: 'customdeploy_da_su_budget_report',
					params:{
						'departmentId':department,
						'classID':recordClass,
                        'itemId': itemId,
                        'urlorigin':window.location.origin
					}
				});
				console.log(suiteletUrl);
               if (window.onbeforeunload) {
                        window.onbeforeunload = function() {
                            null;
                        };
                 };
				window.open(window.location.origin+""+suiteletUrl,'_self');
               
			}
			
			if(scriptContext.fieldId == 'custpage_as_of_month'){
				var department = scriptContext.currentRecord.getValue('custpage_department');
				var recordClass = scriptContext.currentRecord.getValue('custpage_class');
				var postingperiod = scriptContext.currentRecord.getText('custpage_as_of_month');
				var month = postingperiod.split(":")[2].split(" ")[1];
				var year = postingperiod.split(":")[2].split(" ")[2];
				
				var postingperiodId = scriptContext.currentRecord.getValue('custpage_as_of_month');
				
				var monthsobj = {
						'Jan': '01',
						'Feb': '02',
						'Mar': '03',
						'Apr': '04',
						'May': '05',
						'Jun': '06',
						'Jul': '07',
						'Aug': '08',
						'Sep': '09',
						'Oct': '10',
						'Nov': '11',
						'Dec': '12'
				};
				var postingPeriodMonth = monthsobj[month];
				
				var daysinMonth = daysInMonth(postingPeriodMonth,year);
				
				var suiteletUrl = url.resolveScript({
					scriptId: 'customscript_da_su_budget_report',
					deploymentId: 'customdeploy_da_su_budget_report',
					params:{
						'departmentId':department,
						'classID':recordClass,
						'month':postingPeriodMonth,
						'year':year,
						'daysinMonth':daysinMonth,
						'ppid':postingperiodId
					}
				});
				console.log(suiteletUrl);
                if (window.onbeforeunload) {
                        window.onbeforeunload = function() {
                            null;
                        };
                 };
				window.open(window.location.origin+""+suiteletUrl,'_self');
			}
		}catch(ex){
			console.log(ex.name,ex.message);
		}

	}
	
	function daysInMonth (month, year) {
		return new Date(year, month, 0).getDate();
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
	function postSourcing(scriptContext) {

	}
	/**
	 * Function to be executed after sublist is inserted, removed, or edited.
	 *
	 * @param {Object} scriptContext
	 * @param {Record} scriptContext.currentRecord - Current form record
	 * @param {string} scriptContext.sublistId - Sublist name
	 *
	 * @since 2015.2
	 */
	function sublistChanged(scriptContext) {

	}

	/**
	 * Function to be executed after line is selected.
	 *
	 * @param {Object} scriptContext
	 * @param {Record} scriptContext.currentRecord - Current form record
	 * @param {string} scriptContext.sublistId - Sublist name
	 *
	 * @since 2015.2
	 */
	function lineInit(scriptContext) {

	}

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
	function validateField(scriptContext) {

	}

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
	function validateLine(scriptContext) {

	}

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
	function validateInsert(scriptContext) {

	}

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
	function validateDelete(scriptContext) {

	}

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
		try{
			var objRecord  = scriptContext.currentRecord;
			//alert(objRecord.id);
			var date = objRecord.getText('trandate');
          
          var department = objRecord.getValue('department');
          if(department == "" ||department == null || department == undefined){
            //alert("Please enter Department");
            //return false;
          }
          var classValue = objRecord.getValue('class');
          if(!classValue){
            //alert("Please enter Class");
            //return false;
          }

			if(date){


				var department = objRecord.getValue('department');
				var poclass = objRecord.getValue('class');
				var year = date.split("/")[2];

				var requester = objRecord.getValue('entity');

				var requesterName = objRecord.getText('entity');

				var month = date.split("/")[1];

				console.log("month"+month);

				var yearId = 0;
				var accountingperiodSearchObj = search.create({
					type: "accountingperiod",
					filters:
						[
							["periodname","is","FY "+year]
							]
				});
				accountingperiodSearchObj.run().each(function(result){
					yearId = result.id;
				});

				console.log("yearId"+ yearId);

				if(yearId > 0){

					var obj ={};
					var emailList = [];

					var numLinesOfItem = objRecord.getLineCount({
						sublistId: 'item'
					});
                  
                    
					var numLines = objRecord.getLineCount({
						sublistId: 'expense'
					});

					for(var i =0;i < numLinesOfItem ;i++){
						var itemType  = objRecord.getSublistValue({
							sublistId: 'item',
							fieldId: 'custcol_da_item_type_bc',
							line: i
						});

						var account ;

						if(itemType == 1 || itemType == 5){
							account = objRecord.getSublistValue({
								sublistId: 'item',
								fieldId: 'custcol_da_item_asset_account',
								line: i
							});

							var accountText = objRecord.getSublistText({
								sublistId: 'item',
								fieldId: 'custcol_da_item_asset_account',
								line: i
							});
						}else{

							account = objRecord.getSublistValue({
								sublistId: 'item',
								fieldId: 'custcol_da_item_expense_account',
								line: i
							});

							var accountText = objRecord.getSublistText({
								sublistId: 'item',
								fieldId: 'custcol_da_item_expense_account',
								line: i
							});

						}

						
						
						var lineDepartment = objRecord.getSublistValue({
							sublistId: 'item',
							fieldId: 'department',
							line: i
						});
						
						var lineClass = objRecord.getSublistValue({
							sublistId: 'item',
							fieldId: 'class',
							line: i
						});

						var userEnteredAmount = objRecord.getSublistValue({
							sublistId: 'item',
							fieldId: 'estimatedamount',
							line: i
						});
						console.log("Account"+account);

						var budgetRecId = 0;

						var budgetimportSearchObj = search.create({
							type: "budgetimport",
							filters:
								[
									["account","anyof",account], 
									"AND", 
									["year","anyof",yearId]
									],
									columns:
										[
											search.createColumn({name: "internalid", label: "Internal ID"})
											]
						});
						if(lineDepartment){
							budgetimportSearchObj.filters.push(search.createFilter({
								"name"    : "department",
								"operator": "anyof",
								"values"  : lineDepartment
							}));
						}
						if(lineClass){
							budgetimportSearchObj.filters.push(search.createFilter({
								"name"    : "class",
								"operator": "anyof",
								"values"  : lineClass
							}));
						}
						budgetimportSearchObj.run().each(function(result){
							budgetRecId = result.id;
						});

						console.log("budgetRecId"+budgetRecId);

						if(budgetRecId > 0){
							var totalBudgetAmount = 0;
							var budgetRec = record.load({
								type:'budgetImport',
								id:budgetRecId,
								isDynamic:false
							});

							var monthAmount = budgetRec.getValue('periodamount'+month);


							for(var k = 1 ;k <= month;k++){							

								var amount = budgetRec.getValue('periodamount'+k);
								console.log(amount);
								totalBudgetAmount = parseFloat(totalBudgetAmount)+parseFloat(amount);
							}

							var purchaserequisitionSearchObj = search.create({
								type: "purchaserequisition",
								filters:
									[
										["type","anyof","PurchReq"], 
										"AND", 
										["advancetoapplyaccount.internalid","anyof",account], 
										"AND", 
										["trandate","within","thisyeartodate"]
										],
										columns:
											[
												search.createColumn({
													name: "estimatedamount",
													summary: "SUM",
													label: "Estimated Amount"
												}),
												search.createColumn({
													name: "name",
													join: "advanceToApplyAccount",
													summary: "GROUP",
													label: "Name"
												})
												]
							});
							if(lineDepartment){
								purchaserequisitionSearchObj.filters.push(search.createFilter({
									"name"    : "department",
									"operator": "anyof",
									"values"  : lineDepartment
								}));
							}
							if(lineClass){
								purchaserequisitionSearchObj.filters.push(search.createFilter({
									"name"    : "class",
									"operator": "anyof",
									"values"  : lineClass
								}));
							}

							if(mode == 'edit'){
								purchaserequisitionSearchObj.filters.push(search.createFilter({
									"name"    : "internalid",
									"operator": "noneof",
									"values"  : objRecord.id
								}));
							}
							var previousRequestionsAmount = 0;
							var searchResultCount = purchaserequisitionSearchObj.runPaged().count;
							log.debug("purchaserequisitionSearchObj result count",searchResultCount);
							purchaserequisitionSearchObj.run().each(function(result){
								var amount = result.getValue({name:'estimatedamount',summary: search.Summary.SUM});
								previousRequestionsAmount = parseFloat(previousRequestionsAmount)+parseFloat(amount);
								return true;
							});

							console.log("totalBudgetAmount"+totalBudgetAmount+"previousRequestionsAmount"+previousRequestionsAmount);

							totalBudgetAmount = parseFloat(totalBudgetAmount) - parseFloat(previousRequestionsAmount);
							console.log("totalBudgetAmount"+totalBudgetAmount);

							if(userEnteredAmount > totalBudgetAmount){
								console.log(true);
								obj[accountText] = numberWithCommas(addZeroes(totalBudgetAmount.toString()));
								var emailObj = {
										'account': accountText,
										'remainingbudgetamount': numberWithCommas(addZeroes(totalBudgetAmount.toString())),
										'userenteredamount': numberWithCommas(addZeroes(userEnteredAmount.toString()))
								};
								emailList.push(emailObj);
							}

						}
					}

					for(var i =0;i<numLines ;i++){
						var account = objRecord.getSublistValue({
							sublistId: 'expense',
							fieldId: 'account',
							line: i
						});

						var accountText = objRecord.getSublistText({
							sublistId: 'expense',
							fieldId: 'account',
							line: i
						});
						
						var lineDepartment = objRecord.getSublistValue({
							sublistId: 'expense',
							fieldId: 'department',
							line: i
						});
						
						var lineClass = objRecord.getSublistValue({
							sublistId: 'expense',
							fieldId: 'class',
							line: i
						});

						var userEnteredAmount = objRecord.getSublistValue({
							sublistId: 'expense',
							fieldId: 'estimatedamount',
							line: i
						});
						console.log("Account"+account);

						var budgetRecId = 0;

						var budgetimportSearchObj = search.create({
							type: "budgetimport",
							filters:
								[
									["account","anyof",account], 
									"AND", 
									["year","anyof",yearId]
									],
									columns:
										[
											search.createColumn({name: "internalid", label: "Internal ID"})
											]
						});
						if(lineDepartment){
							budgetimportSearchObj.filters.push(search.createFilter({
								"name"    : "department",
								"operator": "anyof",
								"values"  : lineDepartment
							}));
						}
						if(lineClass){
							budgetimportSearchObj.filters.push(search.createFilter({
								"name"    : "class",
								"operator": "anyof",
								"values"  : lineClass
							}));
						}
						budgetimportSearchObj.run().each(function(result){
							budgetRecId = result.id;
						});

						console.log("budgetRecId"+budgetRecId);

						if(budgetRecId > 0){
							var totalBudgetAmount = 0;
							var budgetRec = record.load({
								type:'budgetImport',
								id:budgetRecId,
								isDynamic:false
							});

							var monthAmount = budgetRec.getValue('periodamount'+month);


							for(var k = 1 ;k <= month;k++){							

								var amount = budgetRec.getValue('periodamount'+k);
								console.log(amount);
								totalBudgetAmount = parseFloat(totalBudgetAmount)+parseFloat(amount);
							}

							var purchaserequisitionSearchObj = search.create({
								type: "purchaserequisition",
								filters:
									[
										["type","anyof","PurchReq"], 
										"AND", 
										["advancetoapplyaccount.internalid","anyof",account], 
										"AND", 
										["trandate","within","thisyeartodate"]
										],
										columns:
											[
												search.createColumn({
													name: "estimatedamount",
													summary: "SUM",
													label: "Estimated Amount"
												}),
												search.createColumn({
													name: "name",
													join: "advanceToApplyAccount",
													summary: "GROUP",
													label: "Name"
												})
												]
							});
							if(lineDepartment){
								purchaserequisitionSearchObj.filters.push(search.createFilter({
									"name"    : "department",
									"operator": "anyof",
									"values"  : lineDepartment
								}));
							}
							if(lineClass){
								purchaserequisitionSearchObj.filters.push(search.createFilter({
									"name"    : "class",
									"operator": "anyof",
									"values"  : lineClass
								}));
							}
							if(mode == 'edit'){
								purchaserequisitionSearchObj.filters.push(search.createFilter({
									"name"    : "internalid",
									"operator": "noneof",
									"values"  : objRecord.id
								}));
							}
							var previousRequestionsAmount = 0;
							var searchResultCount = purchaserequisitionSearchObj.runPaged().count;
							log.debug("purchaserequisitionSearchObj result count",searchResultCount);
							purchaserequisitionSearchObj.run().each(function(result){
								var amount = result.getValue({name:'estimatedamount',summary: search.Summary.SUM});
								previousRequestionsAmount = parseFloat(previousRequestionsAmount)+parseFloat(amount);
								return true;
							});

							console.log("totalBudgetAmount"+totalBudgetAmount+"previousRequestionsAmount"+previousRequestionsAmount);

							totalBudgetAmount = parseFloat(totalBudgetAmount) - parseFloat(previousRequestionsAmount);
							console.log("totalBudgetAmount"+totalBudgetAmount);

							if(userEnteredAmount > totalBudgetAmount){
								console.log(true);
								obj[accountText] = numberWithCommas(addZeroes(totalBudgetAmount.toString()));
								var emailObj = {
										'account': accountText,
										'remainingbudgetamount': numberWithCommas(addZeroes(totalBudgetAmount.toString())),
										'userenteredamount': numberWithCommas(addZeroes(userEnteredAmount.toString()))
								};
								emailList.push(emailObj);
							}

						}
					}

					console.log(obj);
					var count = [];
					for (var key in obj) {
						if (obj.hasOwnProperty(key)) {
							count.push("set");
						}
					}
					
					
					var finaceManager =  objRecord.getValue('custbody_red_sea_finance_manger');
					console.log('finaceManager',finaceManager);
					
										

					if(count.length > 0 && finaceManager){
						alert("Sorry you cant create requisition with this amount, please contact finance controller to adjust the budget\n You have only these amounts at account level\n"+JSON.stringify((obj)));
						var htmlBody = '';
						for (i in emailList) {
							htmlBody += '<tr><td>' + emailList[i].account+ '</td><td>' + emailList[i].remainingbudgetamount+ '</td><td>' + emailList[i].userenteredamount+ '</td></tr>';
						}
						htmlBody = 'Hi, <br /> Employee : <b>'+requesterName +'</b> is trying to create to Purchase Requestion for the following accounts, but there is no sufficent budget for those accounts, <br /> Please review it once and adjust the budget accordingly.<br /><table border = "2"><tr><th>Account</th><th>Remaining Budget Amount</th><th>User Entered Value</th></tr>' + htmlBody + '</table>';
						email.send({
							author: requester,
							recipients: finaceManager,
							subject: 'Budget Notification',
							body:htmlBody
						});
						return false;
					}
				}
			}
			return true;


		}catch(ex){
			console.log(ex.name,ex.message);
		}

	}

	function addZeroes( num ) {
		var value = Number(num);
		var res = num.split(".");
		if(res.length == 1 || (res[1].length < 3)) {
			value = value.toFixed(2);
		}
		return value;
	}

	function numberWithCommas(x) {		
		return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}
  
  function goBack(){
    history.go(-1);
  }

	return {
		pageInit: pageInit,
		fieldChanged: fieldChanged,
//		postSourcing: postSourcing,
//		sublistChanged: sublistChanged,
//		lineInit: lineInit,
//		validateField: validateField,
//		validateLine: validateLine,
//		validateInsert: validateInsert,
//		validateDelete: validateDelete,
		saveRecord: saveRecord,
      goBack:goBack
	};

});

/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope TargetAccount
 */
define(['N/ui/serverWidget', 'N/search','N/record','N/url','N/config'],

		function(ui, search,record,url,config) {

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
			var request = context.request;
			var response = context.response;

			if (context.request.method === 'GET') {


				var form = ui.createForm({
					title: 'Budget Report'
				});
				var tab = form.addSubtab({
					id: 'custpage_tab',
					label: 'Report'
				});	
				var configRecObj = config.load({
				    type: config.Type.COMPANY_INFORMATION
				});
				var NetsuiteaccountID = configRecObj.getValue('companyid');
              log.debug('NetsuiteaccountID',NetsuiteaccountID);
              NetsuiteaccountID = NetsuiteaccountID.toString();
              NetsuiteaccountID.split("_");
    //remove          NetsuiteaccountID = NetsuiteaccountID.split("_")[0]+"-"+NetsuiteaccountID.split("_")[1];
              log.debug('NetsuiteaccountID',NetsuiteaccountID);
				
				var currentYear = new Date().getFullYear();
				
				//log.debug('currentYear',currentYear);
				
				var accountingPeriodId;
				
				var accountingperiodSearchObj = search.create({
					   type: "accountingperiod",
					   filters:
					   [
					      ["isyear","is","T"], 
					      "AND", 
					      ["periodname","contains",currentYear.toString()]
					   ],
					   columns:
						   ['internalid']
					});
					var searchResultCount = accountingperiodSearchObj.runPaged().count;
					log.debug("accountingperiodSearchObj result count",searchResultCount);
				
					accountingperiodSearchObj.run().each(function(result){
					   accountingPeriodId = result.getValue('internalid');
					   return true;
					});
				
				log.debug(accountingPeriodId);
				//Report Sublist			
				var reportList = form.addSublist({
					id: 'custpage_report_sublist',
					type: ui.SublistType.LIST,
					label: 'Budget Report',
					tab: 'custpage_tab'
				});

				var departmentField = form.addField({
					id: 'custpage_department',
					type: ui.FieldType.SELECT,
					label: 'Department',
					container: 'custpage_tab',
					source:'department'
				});				
				departmentField.updateDisplaySize({
					height: 250,
					width: 440
				});
				var classField = form.addField({
					id: 'custpage_class',
					type: ui.FieldType.SELECT,
					label: 'Class',
					container: 'custpage_tab',
					source: 'classification'
				});
              
              var itemField = form.addField({
					id: 'custpage_item',
					type: ui.FieldType.SELECT,
					label: 'Item',
					container: 'custpage_tab',
					source: 'item'
				}).updateBreakType({
					breakType : ui.FieldBreakType.STARTCOL
				});
				
				var asofField = form.addField({
					id: 'custpage_as_of_month',
					type: ui.FieldType.SELECT,
					label: 'AS Of',
					container: 'custpage_tab',
					source: 'accountingperiod',
                    'showhierarchy':false
				});

				var paginationField = form.addField({
					id: 'custpage_ss_pagination',
					type: ui.FieldType.SELECT,
					label: 'Results',
					container: 'custpage_tab'
				}).updateBreakType({
					breakType : ui.FieldBreakType.STARTCOL
				});
				paginationField.updateDisplaySize({
					height: 250,
					width: 140
				});

				var accountField = reportList.addField({
					id: 'custpage_account',
					type: ui.FieldType.TEXT,
					label: 'Account'
				});
				var totalBudgetField = reportList.addField({
					id: 'custpage_total_budget',
					type: ui.FieldType.CURRENCY,
					label: 'Project Total Budget(Till Date)'
				});
				reportList.addField({
					id: 'custpage_used_budget_amount',
					type: ui.FieldType.TEXTAREA,
					label: 'Spent Budget Amount(Till Date)'
				});
				reportList.addField({
					id: 'custpage_rem_budget_amount',
					type: ui.FieldType.CURRENCY,
					label: 'Remaining Budget Amount'
				});
log.debug('params', request.parameters);
				if (request.parameters.departmentId || request.parameters.classID || request.parameters.itemId) {


					if(request.parameters.departmentId){
						departmentField.defaultValue = request.parameters.departmentId;
					}					
					if(request.parameters.classID){
						classField.defaultValue =request.parameters.classID;
					}	
                  if(request.parameters.itemId){
                    log.audit('true');
						itemField.defaultValue =request.parameters.itemId;
					}
					if(request.parameters.ppid){
						asofField.defaultValue =request.parameters.ppid;
					}

					var myPagedData1 = accountSearchResults(request.parameters.departmentId,request.parameters.classID,request.parameters.itemId,accountingPeriodId);

				} else {
					//departmentField.defaultValue = 1;
					var myPagedData1 = defaultAccountSearchResults(accountingPeriodId);
				}

				log.audit('myPagedData1', myPagedData1);
				var totalResultCount = myPagedData1.count;

				var listOfPages = myPagedData1["pageRanges"];
				var numberOfPages = listOfPages.length;
				if (numberOfPages > 0) {

					var page = dataCount = null;
					var startno = (request.parameters.startno) ? (request.parameters.startno) : 0;
					log.audit('listOfPages', listOfPages);
					for (var i = 0; i < numberOfPages; i++) {
						var paginationTextEnd = (totalResultCount >= (i * 35) + 35) ? ((i * 35) + 35) : totalResultCount;
						paginationField.addSelectOption({
							value: listOfPages[i].index,
							text: ((i * 35) + 1) + ' to ' + paginationTextEnd + ' of ' + totalResultCount,
							isSelected: (startno == i)
						});
					}

					page = myPagedData1.fetch({
						index: startno
					});

					dataCount = page.data.length;
					var totalAmountFromCust = 0;
					var i = 0;
					var tTotalAmount = 0, tInoviceAmount = 0,tPaymentAmount = 0,tNetPaymentAmount=0, tcustAppliedAmount = 0,tunpiadInvAmount = 0, tInsAmount = 0, tpaidinsAmount = 0,tunpaidinsAmount = 0;
					myPagedData1.pageRanges.forEach(function(pageRange) {
						if(myPagedData1.pageRanges.length <= 0)return;
						var myPage = myPagedData1.fetch({
							index: (request.parameters.startno) ? (request.parameters.startno) : 0
						});
						log.audit('my page',i+" "+dataCount);
						//var i = 0;
						//var arr = [];
						myPage.data.forEach(function(result) {

							// log.debug(arr.indexOf(result.id));
							// log.debug('arr',arr);
							if((i-1) < dataCount){
								//arr.push(result.id);
								var account = result.getValue({
									name: 'account'
								});

								log.debug('Account',account);



								/*reportList.setSublistValue({
									id: 'custpage_contractno',
									line: i,
									value: "<html><style type='text/css'>a { text-decoration:none; }</style><a href=/app/common/custom/custrecordentry.nl?rectype=202&id=" + result.id + "&whence=><font color='#255599'>" + contractNO + "</font></a></html>"
								});
								reportList.setSublistValue({
									id: 'custpage_cont_customer',
									line: i,
									value: "<html><style type='text/css'>a { text-decoration:none; }</style><a href=/app/common/entity/custjob.nl?id=" + customer + "&whence=><font color='#255599'>" + customerName + "</font></a></html>"
								});*/
								reportList.setSublistValue({
									id: 'custpage_account',
									line: i,
									value: account
								});

								var budgetRec = record.load({
									type:'budgetImport',
									id:result.id,
									isDynamic:false
								});
								var accountId = budgetRec.getValue('account');
								
								if(request.parameters.month){
									var month = request.parameters.month;
								}else{
									var month = (new Date().getMonth())+1;
								}
								

								var totalBudgetAmount = 0;

								var suiteletUrl = url.resolveScript({
									scriptId: 'customscript_da_su_budget_requestions',
									deploymentId: 'customdeploy_da_su_budget_requestions',
									params:{
										'departmentId':request.parameters.departmentId,
										'classID':request.parameters.classID,
										'accountId':accountId,
                                        'itemId': request.parameters.itemId,
										'year':request.parameters.year,
										'daysinMonth':request.parameters.daysinMonth,
										'month':request.parameters.month,
										'compId':NetsuiteaccountID
									}
								});

								//log.debug('Month',month);
								for(var k = 1 ;k <= month;k++){	
									var amount = 0;
									try{
										amount = budgetRec.getValue('periodamount'+k);
										//log.debug(amount);
									}catch(ex){
										log.error('There is no budget for this month');
									}									
									//console.log(amount);
									if(amount > 0){
										totalBudgetAmount = parseFloat(totalBudgetAmount)+parseFloat(amount);
									}
									
								}
								//log.debug('totalBudgetAmount',totalBudgetAmount);

								reportList.setSublistValue({
									id: 'custpage_total_budget',
									line: i,
									value: (totalBudgetAmount)?totalBudgetAmount:0
								});

								var purchaserequisitionSearchObj = search.create({
									type: "transaction",
									filters:
										[
											["type","anyof","PurchReq","PurchOrd"],
											"AND", 
											["account","anyof",accountId]
											],
											columns:
												[
													search.createColumn({
														name: "amount",
														summary: "SUM",
														label: "Estimated Amount"
													}),
													search.createColumn({
														name: "account",
														summary: "GROUP",
														label: "Name"
													})
													]
								});
								if(request.parameters.departmentId){
									purchaserequisitionSearchObj.filters.push(search.createFilter({
										"name"    : "department",
										"operator": "anyof",
										"values"  : request.parameters.departmentId
									}));
								}
                             /* else{
									purchaserequisitionSearchObj.filters.push(search.createFilter({
										"name"    : "department",
										"operator": "anyof",
										"values"  : 1
									}));
								}*/
								if(request.parameters.classID){
									purchaserequisitionSearchObj.filters.push(search.createFilter({
										"name"    : "class",
										"operator": "anyof",
										"values"  : request.parameters.classID
									}));
								}
								
								if(request.parameters.month){
									purchaserequisitionSearchObj.filters.push(search.createFilter({
										"name"    : "trandate",
										"operator": "within",
										"values"  : ["01/01/"+request.parameters.year,request.parameters.daysinMonth+"/"+request.parameters.month+"/"+request.parameters.year]
									}));
								}else{
									purchaserequisitionSearchObj.filters.push(search.createFilter({
										"name"    : "trandate",
										"operator": "within",
										"values"  : "thisyear"
									}));
								}
                              
                              if(request.parameters.itemId){
                                purchaserequisitionSearchObj.filters.push(search.createFilter({
										"name"    : "item",
										"operator": "anyof",
										"values"  : request.parameters.itemId
									}));
                              }
								
								
								var previousRequestionsAmount = 0;
								purchaserequisitionSearchObj.run().each(function(result){
									//log.debug(result.id);
									var amount = result.getValue({name:'amount',summary: search.Summary.SUM});
                                  log.debug('amount', amount);
									previousRequestionsAmount = parseFloat(previousRequestionsAmount)+parseFloat(amount);
									return true;
								});
                              
                              log.debug('previousRequestionsAmount', previousRequestionsAmount);



								reportList.setSublistValue({
									id: 'custpage_used_budget_amount',
									line: i,
									value: "<html><style type='text/css'>a { text-decoration:none; text-align: right;}</style><a href=https://"+NetsuiteaccountID+".app.netsuite.com" + suiteletUrl + "&whence=><font color='#255599'><p align ='center'>" + previousRequestionsAmount + "</p></font></a></html>"
								});

								var remainingAmount = parseFloat(totalBudgetAmount) - parseFloat(previousRequestionsAmount);

								reportList.setSublistValue({
									id: 'custpage_rem_budget_amount',
									line: i,
									value: remainingAmount
								});

								i++;
							};
							return true;
						});
					});
				}


				context.response.writePage(form);

				form.clientScriptModulePath = './DA_CS_Requisition_Budget_Alert.js'
			}			

		} catch (ex) {
			log.error(ex.name, ex.message);
		}

	}

	function defaultAccountSearchResults(accountingPeriodId) {
		var budgetimportSearchObj = search.create({
			type: "budgetimport",
			filters:
				[
					 
				      ["year","anyof",accountingPeriodId],"AND",["item","anyof","@NONE@"]
					],
					columns:
						[
							search.createColumn({
								name: "account",
								sort: search.Sort.ASC,
								label: "Account"
							}),
							search.createColumn({name: "year", label: "Year"}),
							search.createColumn({name: "department", label: "Department"}),
							search.createColumn({name: "class", label: "Class"}),
							search.createColumn({name: "customer", label: "Customer"}),
							search.createColumn({name: "amount", label: "Amount"}),
							search.createColumn({name: "category", label: "Category"}),
							search.createColumn({name: "global", label: "Global"}),
							search.createColumn({name: "item", label: "Item"})
							]
		});
		var searchResultCount = budgetimportSearchObj.runPaged().count;
		log.debug("budgetimportSearchObj result count",searchResultCount);
		var myPagedData = budgetimportSearchObj.runPaged({
			pageSize: 35
		});
		return myPagedData;

	}	

	function accountSearchResults(departmentId, classID,itemId ,accountingPeriodId){

		//log.error("sDate",sDate);
		var budgetimportSearchObj = search.create({
			type: "budgetimport",
			filters:
				[["year","anyof",accountingPeriodId]],
				columns:
					[
						search.createColumn({
							name: "account",
							sort: search.Sort.ASC,
							label: "Account"
						}),
						search.createColumn({name: "year", label: "Year"}),
						search.createColumn({name: "department", label: "Department"}),
						search.createColumn({name: "class", label: "Class"}),
						search.createColumn({name: "customer", label: "Customer"}),
						search.createColumn({name: "amount", label: "Amount"}),
						search.createColumn({name: "category", label: "Category"}),
						search.createColumn({name: "global", label: "Global"}),
						search.createColumn({name: "item", label: "Item"})
						]
		});

		if(departmentId){
			budgetimportSearchObj.filters.push(search.createFilter({
				"name"    : "department",
				"operator": "anyof",
				"values"  : departmentId
			}));
		}
      /*else{
			budgetimportSearchObj.filters.push(search.createFilter({
				"name"    : "department",
				"operator": "anyof",
				"values"  : "@NONE@"
			}));
		}*/
		if(classID){
			budgetimportSearchObj.filters.push(search.createFilter({
				"name"    : "class",
				"operator": "anyof",
				"values"  : classID
			}));
		}
      /*else{
			budgetimportSearchObj.filters.push(search.createFilter({
				"name"    : "class",
				"operator": "anyof",
				"values"  : "@NONE@"
			}));
		}*/
      
      if(itemId){
        budgetimportSearchObj.filters.push(search.createFilter({
				"name"    : "item",
				"operator": "anyof",
				"values"  : itemId
			}));
      }

		var myPagedData = budgetimportSearchObj.runPaged({
			pageSize: 35
		});
		return myPagedData;
	}

	return {
		onRequest: onRequest
	};

});
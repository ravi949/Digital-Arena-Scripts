/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope TargetAccount
 */
define(['N/ui/serverWidget', 'N/search','N/record'],

		function(ui, search,record) {

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
					title: 'Related transactions'
				});
				var tab = form.addSubtab({
					id: 'custpage_tab',
					label: 'Results'
				});	
				
				form.addButton({
				    id : 'custpage_back',
				    label : 'Back',
				    functionName :'goBack()'
				});
				//Report Sublist			
				var reportList = form.addSublist({
					id: 'custpage_report_sublist',
					type: ui.SublistType.LIST,
					label: 'Purchase Requestions',
					tab: 'custpage_tab'
				});
				var accountField = reportList.addField({
					id: 'custpage_po_req_id',
					type: ui.FieldType.TEXT,
					label: 'Po Req Ref #'
				});	
              var accountField = reportList.addField({
					id: 'custpage_po_amount',
					type: ui.FieldType.TEXT,
					label: 'Amount'
				});	
	log.debug('params', request.parameters);
				if (request.parameters.departmentId || request.parameters.classID || request.parameters.accountId) {


					var i = 0;

					var purchaserequisitionSearchObj = search.create({
						type: "transaction",
						filters:
							[
								["type","anyof","PurchReq","PurchOrd"], 
								"AND", 
								["account","anyof",request.parameters.accountId]
								],
								columns:[
                                  search.createColumn({
         name: "tranid",
         summary: "GROUP",
         label: "Document Number"
      }),
                                  search.createColumn({
                                          name: "recordtype",
         summary: "GROUP",
         label: "Record Type"
      }),
                                  search.createColumn({
         name: "internalid",
         summary: "GROUP",
         label: "Internal ID"
      }),
                                  search.createColumn({
         name: "amount",
         summary: "SUM",
         label: "Amount"
      }),
									]
					});
                  log.debug('count', purchaserequisitionSearchObj.runPaged().count);
					if(request.parameters.departmentId){
						purchaserequisitionSearchObj.filters.push(search.createFilter({
							"name"    : "department",
							"operator": "anyof",
							"values"  : request.parameters.departmentId
						}));
					}

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
					
					purchaserequisitionSearchObj.run().each(function(result){
                      log.debug('type', result.getValue({name:'tranid',summary: search.Summary.GROUP}));
                      
                      if(result.getValue({name:'recordtype',summary: search.Summary.GROUP}) == 'purchaserequisition'){
                        reportList.setSublistValue({
							id: 'custpage_po_req_id',
							line: i,
							value: "<html><style type='text/css'>a { text-decoration:none; }</style><a href=https://"+request.parameters.compId+".app.netsuite.com/app/accounting/transactions/purchreq.nl?id=" + result.getValue({name:'internalid',summary: search.Summary.GROUP}) + "&whence=><font color='#255599'> Requistion #" + result.getValue({name:'tranid', summary: search.Summary.GROUP}) + "</font></a></html>"
						});
                        reportList.setSublistValue({
							id: 'custpage_po_amount',
							line: i,
							value: result.getValue({name:'amount', summary: search.Summary.SUM})
						});
                      }
                      if(result.getValue({name:'recordtype',summary: search.Summary.GROUP}) == 'purchaseorder'){
                        reportList.setSublistValue({
							id: 'custpage_po_req_id',
							line: i,
							value: "<html><style type='text/css'>a { text-decoration:none; }</style><a href=https://"+request.parameters.compId+".app.netsuite.com/app/accounting/transactions/purchord.nl?id=" + result.getValue({name:'internalid',summary: search.Summary.GROUP}) + "&whence=><font color='#255599'> Purchase Order #" + result.getValue({name:'tranid', summary: search.Summary.GROUP}) + "</font></a></html>"
						});
                         reportList.setSublistValue({
							id: 'custpage_po_amount',
							line: i,
							value: result.getValue({name:'amount', summary: search.Summary.SUM})
						});
                      }
						
						i++;
						return true;
					});

				}

				context.response.writePage(form);

				form.clientScriptModulePath = './DA_CS_Requisition_Budget_Alert.js'
			}			

		} catch (ex) {
			log.error(ex.name, ex.message);
		}

	}
	

	return {
		onRequest: onRequest
	};

});
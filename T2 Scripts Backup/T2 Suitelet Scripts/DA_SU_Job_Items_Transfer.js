/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope TargetAccount
 */
define(['N/ui/serverWidget', 'N/search','N/runtime','N/redirect','N/record'],

		function(ui, search,runtime,redirect,record) {

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

			if (context.request.method == 'GET') {

				var lookup = search.lookupFields({
					type: 'customrecord_da_maintenance_settings',
					id: 1,
					columns: ['custrecord_da_spare_parts_location']
				})
				var defaultSparePartLocation =lookup.custrecord_da_spare_parts_location[0].value;
				log.debug(defaultSparePartLocation);
				var form = ui.createForm({
					title: 'Transfer Items'
				});



				var tab = form.addSubtab({
					id: 'custpage_tab',
					label: 'Related Data'
				});
				//Report Sublist			
				var reportList = form.addSublist({
					id: 'custpage_report_data_sublist',
					type: ui.SublistType.INLINEEDITOR,
					label: 'Related Data',
					tab: 'custpage_tab'
				});
				var hideFld = form.addField({
					id:'custpage_hide_buttons',
					label:'not shown - hidden',
					container: 'custpage_tab',
					type: ui.FieldType.INLINEHTML
				});
				var scr = "";
//				scr += 'jQuery("#custpage_report_data_sublist_buttons").hide();';
//				scr += 'jQuery("#custpage_report_data_sublist_insert").hide();';
				scr += 'jQuery("#custpage_report_data_sublist_remove").hide();';

//				push the script into the field so that it fires and does its handy work
				hideFld.defaultValue = "<script>jQuery(function($){require([], function(){" + scr + ";})})</script>"

				var techinicianField = form.addField({
					id: 'custpage_technician',
					type: ui.FieldType.SELECT,
					label: 'technician',
					container: 'custpage_tab',
					source:'employee'
				});


				var jobCardField = form.addField({
					id: 'custpage_job_card_id',
					type: ui.FieldType.SELECT,
					label: 'Job Card',
					container: 'custpage_tab',
					source:'customrecord_da_job_cards'
				});
				jobCardField.updateBreakType({
					breakType : ui.FieldBreakType.STARTCOL
				});

				var ItemField = form.addField({
					id: 'custpage_item_id',
					type: ui.FieldType.SELECT,
					label: 'Item',
					container: 'custpage_tab',
					source:'item'
				});
				ItemField.updateBreakType({
					breakType : ui.FieldBreakType.STARTCOL
				});
				var paginationField = form.addField({
					id: 'custpage_ss_pagination',
					type: ui.FieldType.SELECT,
					label: 'Results',
					container: 'custpage_tab'
				}).updateLayoutType({
					layoutType: ui.FieldLayoutType.NORMAL
				});
				paginationField.updateBreakType({
					breakType : ui.FieldBreakType.STARTCOL
				});
				paginationField.updateDisplaySize({
					height: 250,
					width: 140
				});

				reportList.addField({
					id: 'custpage_transfer',
					type: ui.FieldType.CHECKBOX,
					label: 'Transfer'
				});	
				reportList.addField({
					id: 'custpage_techinician',
					type: ui.FieldType.TEXT,
					label: 'Technician'
				}).updateDisplayType({
					displayType : ui.FieldDisplayType.DISABLED
				});
				reportList.addField({
					id: 'custpage_jobcard_no',
					type: ui.FieldType.TEXT,
					label: 'JC ID'
				}).updateDisplayType({
					displayType : ui.FieldDisplayType.DISABLED
				}).isMandatory = true;
				
				reportList.addField({
					id: 'custpage_jobcard_id',
					type: ui.FieldType.TEXT,
					label: 'Job Card'
				}).updateDisplayType({
					displayType : ui.FieldDisplayType.HIDDEN
				}).isMandatory = true;

				reportList.addField({
					id: 'custpage_jobcard_date',
					type: ui.FieldType.DATE,
					label: 'Date'
				}).updateDisplayType({
					displayType : ui.FieldDisplayType.DISABLED
				});
				reportList.addField({
					id: 'custpage_gsx_no',
					type: ui.FieldType.TEXT,
					label: 'GSX No'
				}).updateDisplayType({
					displayType : ui.FieldDisplayType.HIDDEN
				});



				var customerfield = reportList.addField({
					id: 'custpage_job_customer',
					type: ui.FieldType.TEXT,
					label: 'Customer'
				}).updateDisplayType({
					displayType : ui.FieldDisplayType.HIDDEN
				});

				reportList.addField({
					id: 'custpage_job_item_text',
					type: ui.FieldType.TEXT,
					label: 'Item',
					source:'item'
				}).updateDisplayType({
					displayType : ui.FieldDisplayType.DISABLED
				});
				reportList.addField({
					id: 'custpage_job_item',
					type: ui.FieldType.TEXT,
					label: 'Item',
					source:'item'
				}).updateDisplayType({
					displayType : ui.FieldDisplayType.HIDDEN
				});

				var InvNo = reportList.addField({
					id: 'custpage_item_desc',
					type: ui.FieldType.TEXT,
					label: 'Item Description'
				}).updateDisplayType({
					displayType : ui.FieldDisplayType.DISABLED
				});

				reportList.addField({
					id: 'custpage_return_to_apple',
					type: ui.FieldType.CHECKBOX,
					label: 'Return to Apple'
				}).updateDisplayType({
					displayType : ui.FieldDisplayType.HIDDEN
				});

				reportList.addField({
					id: 'custpage_from_location',
					type: ui.FieldType.SELECT,
					label: 'From Location',
					source:'location'
				});

				reportList.addField({
					id: 'custpage_sparepart_id',
					type: ui.FieldType.TEXT,
					label: 'SparePart ID'
				}).updateDisplayType({
					displayType : ui.FieldDisplayType.HIDDEN
				});

				reportList.addField({
					id: 'custpage_to_location',
					type: ui.FieldType.SELECT,
					label: 'To Location',
					source:'location'
				}).updateDisplayType({
					displayType : ui.FieldDisplayType.DISABLED
				});

				var availQty = reportList.addField({
					id: 'custpage_avail_qty',
					type: ui.FieldType.TEXT,
					label: 'Avail QTY'
				}).updateDisplayType({
					displayType : ui.FieldDisplayType.HIDDEN
				});

				reportList.addField({
					id: 'custpage_serailzed',
					type: ui.FieldType.TEXT,
					label: 'Serialzed?'
				}).updateDisplayType({
					displayType : ui.FieldDisplayType.DISABLED
				});

				reportList.addField({
					id: 'custpage_serial_no',
					type: ui.FieldType.TEXT,
					label: 'Serail No'
				});
				
				reportList.addField({
					id: 'custpage_serial_no_id',
					type: ui.FieldType.TEXT,
					label: 'Serail No'
				}).updateDisplayType({
					displayType : ui.FieldDisplayType.HIDDEN
				});	

				var myPagedData1, myPagedData2;


				if (request.parameters.technician || request.parameters.jobcardid || request.parameters.item) {
					if(request.parameters.technician){
						techinicianField.defaultValue = request.parameters.technician;
					}
					if(request.parameters.jobcardid){
						jobCardField.defaultValue = request.parameters.jobcardid;						
					}
					if(request.parameters.item){
						ItemField.defaultValue = request.parameters.item;
					}
					myPagedData1 = searchForPendingFullfillmentData(request.parameters.technician,request.parameters.jobcardid,request.parameters.item);
				}else{
					myPagedData1 = searchForPendingFullfillmentData();
				}
				//log.audit('myPagedData1', myPagedData1);
				var totalResultCount = myPagedData1.count;

				var listOfPages = myPagedData1["pageRanges"];
				var numberOfPages = listOfPages.length;
				if (numberOfPages > 0) {

					form.addSubmitButton({
						label : 'Submit'
					});

					var page = null;
                        var dataCount = null;
					var startno = (request.parameters.startno) ? (request.parameters.startno) : 0;
					//log.audit('listOfPages', listOfPages);
					for (var i = 0; i < numberOfPages; i++) {
						var paginationTextEnd = (totalResultCount >= (i * 500) + 500) ? ((i * 500) + 500) : totalResultCount;
						paginationField.addSelectOption({
							value: listOfPages[i].index,
							text: ((i * 500) + 1) + ' to ' + paginationTextEnd + ' of ' + totalResultCount,
							isSelected: (startno == i)
						});
					}

					page = myPagedData1.fetch({
						index: startno
					});

					dataCount = page.data.length;
					var totalAmountFromCust = 0;
					var i = 0;
					myPagedData1.pageRanges.forEach(function(pageRange) {
						if(myPagedData1.pageRanges.length <= 0)return;
						var myPage = myPagedData1.fetch({
							index: (request.parameters.startno) ? (request.parameters.startno) : 0
						});
						log.audit('my page',myPage);
						//var i = 0;
						//var arr = [];
						myPage.data.forEach(function(result) {

							// log.debug(arr.indexOf(result.id));
							// log.debug('arr',arr);
							if(i <= (dataCount- 1)){
								//arr.push(result.id);
								var techinician = result.getText({
									name: 'custrecord_techinican_id'
								});
								log.debug('techinician',techinician);
								var jobCardID = result.getValue({
									name: 'custrecord_da_new_part_job_card'
								});
								log.debug('jobCardID',jobCardID);
								var jobCarddate = result.getValue({
									name:'custrecord_job_card_date'
								});
								log.debug('jobCarddate',jobCarddate);

								var itemDesc = result.getValue({
									name: 'custrecord_da_spare_part_requested_desc'
								});
								log.debug('itemDesc',itemDesc);
								reportList.setSublistValue({
									id: 'custpage_techinician',
									line: i,
									value: (techinician)?techinician:' '
								});
								
								reportList.setSublistValue({
									id: 'custpage_jobcard_no',
									line: i,
									value: result.getText('custrecord_da_new_part_job_card')
								});

								reportList.setSublistValue({
									id: 'custpage_jobcard_id',
									line: i,
									value: (jobCardID)?jobCardID:' '
								});
								reportList.setSublistValue({
									id: 'custpage_jobcard_date',
									line: i,
									value: (jobCarddate)?jobCarddate:' '
								});
								reportList.setSublistValue({
									id: 'custpage_serailzed',
									line: i,
									value: result.getValue('custrecord_item_serialzed')?result.getValue('custrecord_item_serialzed'):' '
								});

								reportList.setSublistValue({
									id: 'custpage_job_item_text',
									line: i,
									value: (result.getText('custrecord_da_spare_part_requested_item'))?result.getText('custrecord_da_spare_part_requested_item'):' '
								});
								reportList.setSublistValue({
									id: 'custpage_job_item',
									line: i,
									value: (result.getValue('custrecord_da_spare_part_requested_item'))?result.getValue('custrecord_da_spare_part_requested_item'):' '
								});
								reportList.setSublistValue({
									id: 'custpage_item_desc',
									line: i,
									value: (itemDesc)?itemDesc :' '
								});

								reportList.setSublistValue({
									id: 'custpage_from_location',
									line: i,
									value: (defaultSparePartLocation)?defaultSparePartLocation :' '
								});

								reportList.setSublistValue({
									id: 'custpage_sparepart_id',
									line: i,
									value: (result.getText('custrecord_da_spare_part_ref_2'))?result.getText('custrecord_da_spare_part_ref_2'):' '
								});

								reportList.setSublistValue({
									id: 'custpage_to_location',
									line: i,
									value: (result.getValue('custrecord_technician_location'))?result.getValue('custrecord_technician_location'):' '
								});
								 log.debug(result.getText('custrecord_da_transfer_return_to_apple'),result.getValue('custrecord_da_transfer_return_to_apple'));
                              if(result.getValue('custrecord_da_transfer_return_to_apple') == false){
                                var t = "F";
                              }else{
                                 var t = "T";
                              }
                               reportList.setSublistValue({
									id: 'custpage_return_to_apple',
									line: i,
									value: t
								});

							/*	var itemSearchObj = search.create({
									type: "item",
									filters:
										[
											["internalid","anyof",result.getValue('custrecord_da_spare_part_requested_item')],"AND",["inventorylocation.internalid","anyof",defaultSparePartLocation]
											],
											columns:
												[					     
													search.createColumn({name: "displayname", label: "Display Name"}),
													search.createColumn({name: "locationquantityavailable", label: "Location Available"})
													]
								});

								reportList.setSublistValue({
									id: 'custpage_avail_qty',
									line:i,
									value: 0

								});

								itemSearchObj.run().each(function(result){
									reportList.setSublistValue({
										id: 'custpage_avail_qty',
										line:i,
										value: (result.getValue('locationquantityavailable'))?result.getValue('locationquantityavailable'):0,

									});
								});*/

								i++;
								return true;
							}
						});
					});
                  var scriptObj = runtime.getCurrentScript();
log.debug("Remaining governance units: " + scriptObj.getRemainingUsage());
				}else{
				}



				context.response.writePage(form);

				form.clientScriptModulePath = './DA_CS_Job_Items_Transfer_Attach.js'
			}else{
				var numLines = request.getLineCount({
					group: 'custpage_report_data_sublist'
				});
				
				var readyToTransfer = record.create({
					type:'customrecord_ready_to_transfer',
					isDynamic:true
				});

				for(var i= 0;i< numLines ;i++){
					var checked = request.getSublistValue({
						group: 'custpage_report_data_sublist',
						name : 'custpage_transfer',
						line: i
					});
					
					if(checked == "T"){
						var itemId = request.getSublistValue({
							group: 'custpage_report_data_sublist',
							name : 'custpage_job_item',
							line: i
						});
						var fromlocation = request.getSublistValue({
							group: 'custpage_report_data_sublist',
							name : 'custpage_from_location',
							line: i
						});
						var tolocation = request.getSublistValue({
							group: 'custpage_report_data_sublist',
							name : 'custpage_to_location',
							line: i
						});
						var sparePartRef = request.getSublistValue({
							group: 'custpage_report_data_sublist',
							name : 'custpage_sparepart_id',
							line: i
						});
						var serialID = request.getSublistValue({
							group: 'custpage_report_data_sublist',
							name : 'custpage_serial_no_id',
							line: i
						});
						var returnToApple = request.getSublistValue({
							group: 'custpage_report_data_sublist',
							name : 'custpage_return_to_apple',
							line: i
						});
                       var jobCardId = request.getSublistValue({
							group: 'custpage_report_data_sublist',
							name : 'custpage_jobcard_id',
							line: i
						});
						if(returnToApple == "F"){
							returnToApple = false;
						}else{
							returnToApple = true;
						}
						log.debug('returnToApple',returnToApple +"serialID "+serialID +"sparePartRef"+sparePartRef+"jobCardId "+jobCardId+"fromlocation "+fromlocation+" itemId"+itemId);
						readyToTransfer.selectNewLine({
							sublistId: 'recmachcustrecord_parent_id'
						});
						
						readyToTransfer.setCurrentSublistValue({
							sublistId: 'recmachcustrecord_parent_id',
							fieldId: 'custrecord_job_item',
							value: itemId
						});
						readyToTransfer.setCurrentSublistValue({
							sublistId: 'recmachcustrecord_parent_id',
							fieldId: 'custrecord_from_location',
							value: fromlocation
						});
						readyToTransfer.setCurrentSublistValue({
							sublistId: 'recmachcustrecord_parent_id',
							fieldId: 'custrecord_to_location',
							value: tolocation
						});
                        readyToTransfer.setCurrentSublistValue({
							sublistId: 'recmachcustrecord_parent_id',
							fieldId: 'custrecord_job_card_id',
							value: jobCardId
						});
						readyToTransfer.setCurrentSublistValue({
							sublistId: 'recmachcustrecord_parent_id',
							fieldId: 'custrecord_spare_part_ref',
							value: sparePartRef
						});
						readyToTransfer.setCurrentSublistValue({
							sublistId: 'recmachcustrecord_parent_id',
							fieldId: 'custrecord_item_serial_id',
							value: serialID
						});
						readyToTransfer.setCurrentSublistValue({
							sublistId: 'recmachcustrecord_parent_id',
							fieldId: 'custrecord_item_return_to_apple',
							value: returnToApple
						});
						readyToTransfer.commitLine('recmachcustrecord_parent_id');
					}
				}
				var recId = readyToTransfer.save();
				
				redirect.toRecord({
				    type : 'customrecord_ready_to_transfer', 
				    id : recId 
				});
				/*var s = search.create({
					type:    "customrecordtype",
					filters:[["scriptid","is","CUSTOMRECORD_JOB_ORDER"]],
					columns:  ["name","scriptid"]
				}).run().getRange(0,1);

				var recordId = s[0].id;
				log.debug(s[0].id);
				//log.debug('numLines',numLines);
				redirect.redirect({
					url: '/app/common/custom/custrecordentry.nl?rectype='+recordId+'&itemSno='+sno
				});*/
			}			

		} catch (ex) {
			log.error(ex.name, ex.message);
		}

	}

	function searchForPreviousJobs(itemsno){



	}

	function searchForPendingFullfillmentData(techinicanId, jobcardId, item) {
		var customrecord_da_spare_part_request_itemsSearchObj = search.create({
			type: "customrecord_da_spare_part_request_items",
			filters:
				[
					],
					columns:
						[
							search.createColumn({
								name: "custrecord_da_new_part_job_card",
								sort: search.Sort.ASC,
								label: "Job Card"
							}),
							search.createColumn({name: "custrecord_techinican_id", label: "Techinician"}),
							search.createColumn({name: "custrecord_job_card_date", label: "Date"}),
							
							search.createColumn({name: "custrecord_da_spare_part_ref_2", label: "Spare part #"}),
							search.createColumn({name: "custrecord_da_spare_part_requested_item", label: "Requested Item"}),
							search.createColumn({name: "custrecord_da_spare_part_requested_desc", label: "Item Description"}),
							search.createColumn({name: "custrecord_da_transfer_return_to_apple", label: "Return To Apple"}),
							search.createColumn({name: "custrecord_da_transfer_from_location", label: "From Location"}),
							search.createColumn({name: "custrecord_technician_location", label: "Technician Location"}),
							search.createColumn({name: "custrecord_da_location_available_qty", label: "Avail Qty"}),
							search.createColumn({name: "custrecord_da_transfer_serial_no", label: "Serial Number"}),
							search.createColumn({name: "custrecord_text_field_s_no", label: "Serial No"}),
							search.createColumn({name: "custrecord_items_transferred", label: "Transferred"}),
							search.createColumn({name: "custrecord_item_serialzed", label: "serialized"})
							]
		});

		if(techinicanId){
			customrecord_da_spare_part_request_itemsSearchObj.filters.push(search.createFilter({
				"name"    : "custrecord_techinican_id",
				"operator": "anyof",
				"values"  : techinicanId
			}));
		}

		if(jobcardId){
			customrecord_da_spare_part_request_itemsSearchObj.filters.push(search.createFilter({
				"name"    : "custrecord_da_new_part_job_card",
				"operator": "anyof",
				"values"  : jobcardId
			}));

		}

		if(item){
			customrecord_da_spare_part_request_itemsSearchObj.filters.push(search.createFilter({
				"name"    : "custrecord_da_spare_part_requested_item",
				"operator": "anyof",
				"values"  : item
			}));
		}
		var searchResultCount = customrecord_da_spare_part_request_itemsSearchObj.runPaged().count;
		log.debug("invoiceSearchObj result count",searchResultCount);

		var myPagedData = customrecord_da_spare_part_request_itemsSearchObj.runPaged({
			pageSize: 500
		});
		return myPagedData;

	}

	return {
		onRequest: onRequest
	};

});
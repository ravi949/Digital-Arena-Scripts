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


                var form = ui.createForm({
                    title: 'Issue To ABM Care'
                });

                var tab = form.addSubtab({
                    id: 'custpage_tab',
                    label: 'Related Data'
                });
                
                form.addButton({
                    id : 'custpage_markall',
                    label : 'Mark All',
                    functionName : 'markAll'
                });
                form.addButton({
                    id : 'custpage_unmarkall',
                    label : 'Unmark All',
                    functionName : 'unmarkAll'
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
//              scr += 'jQuery("#custpage_report_data_sublist_buttons").hide();';
//              scr += 'jQuery("#custpage_report_data_sublist_insert").hide();';
                scr += 'jQuery("#custpage_report_data_sublist_remove").hide();';

//              push the script into the field so that it fires and does its handy work
                hideFld.defaultValue = "<script>jQuery(function($){require([], function(){" + scr + ";})})</script>"

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
                    id: 'custpage_recieve',
                    type: ui.FieldType.CHECKBOX,
                    label: 'Issue'
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
                    displayType : ui.FieldDisplayType.DISABLED
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
                    id: 'custpage_org_rec_id',
                    type: ui.FieldType.TEXT,
                    label: 'Record Id'
                }).updateDisplayType({
                    displayType : ui.FieldDisplayType.DISABLED
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
                }).updateDisplayType({
                    displayType : ui.FieldDisplayType.DISABLED
                });

                reportList.addField({
                    id: 'custpage_in_war_price',
                    type: ui.FieldType.TEXT,
                    label: 'In Warranty Price'
                }).updateDisplayType({
                    displayType : ui.FieldDisplayType.DISABLED
                });

                reportList.addField({
                    id: 'custpage_out_war_price',
                    type: ui.FieldType.TEXT,
                    label: 'Out Warranty Price'
                }).updateDisplayType({
                    displayType : ui.FieldDisplayType.DISABLED
                });
                /*reportList.addField({
                    id: 'custpage_war_status',
                    type: ui.FieldType.TEXT,
                    label: 'Warranty Status'
                }).updateDisplayType({
                    displayType : ui.FieldDisplayType.DISABLED
                });*/
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

                    var page = dataCount = null;
                    var startno = (request.parameters.startno) ? (request.parameters.startno) : 0;
                    //log.audit('listOfPages', listOfPages);
                    for (var i = 0; i < numberOfPages; i++) {
                        var paginationTextEnd = (totalResultCount >= (i * 1000) + 1000) ? ((i * 1000) + 1000) : totalResultCount;
                        paginationField.addSelectOption({
                            value: listOfPages[i].index,
                            text: ((i * 1000) + 1) + ' to ' + paginationTextEnd + ' of ' + totalResultCount,
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
                            if(i <= dataCount - 1){
                                //arr.push(result.id);
                                var techinician = result.getText({
                                    name: 'custrecord_job_card_technician'
                                });
                                var jobCardID = result.getValue({
                                    name: 'custrecord_da_new_part_job_card_kbb'
                                });
                                var jobCarddate = result.getValue({
                                    name:'custrecord_kbb_job_card_date'
                                });

                                var itemDesc = result.getValue({
                                    name: 'custrecord_da_spare_part_kgb_desc'
                                });

                                reportList.setSublistValue({
                                    id: 'custpage_techinician',
                                    line: i,
                                    value: (techinician)?techinician:' '
                                });

                                reportList.setSublistValue({
                                    id: 'custpage_jobcard_no',
                                    line: i,
                                    value: result.getText('custrecord_da_new_part_job_card_kbb')
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
                                    value: result.getValue('custrecord_kbb_item_serialized')?result.getValue('custrecord_kbb_item_serialized'):' '
                                });

                                reportList.setSublistValue({
                                    id: 'custpage_job_item_text',
                                    line: i,
                                    value: (result.getText('custrecord_da_spare_part_item_kbb'))?result.getText('custrecord_da_spare_part_item_kbb'):' '
                                });
                                reportList.setSublistValue({
                                    id: 'custpage_job_item',
                                    line: i,
                                    value: (result.getValue('custrecord_da_spare_part_item_kbb'))?result.getValue('custrecord_da_spare_part_item_kbb'):' '
                                });
                                reportList.setSublistValue({
                                    id: 'custpage_item_desc',
                                    line: i,
                                    value: (itemDesc)?itemDesc :' '
                                });

                                reportList.setSublistValue({
                                    id: 'custpage_org_rec_id',
                                    line: i,
                                    value: result.id
                                });
                                
                                
                               
                                
                                reportList.setSublistValue({
                                    id: 'custpage_in_war_price',
                                    line: i,
                                    value: (result.getValue('custrecord_job_in_warranty_price'))?result.getValue('custrecord_job_in_warranty_price'):' '
                                });
                                
                                reportList.setSublistValue({
                                    id: 'custpage_out_war_price',
                                    line: i,
                                    value: (result.getValue('custrecord_da_job_out_of_warranty_price'))?result.getValue('custrecord_da_job_out_of_warranty_price'):' '
                                });
                                
                               /* reportList.setSublistValue({
                                    id: 'custpage_war_status',
                                    line: i,
                                    value: (result.getText('custrecord_da_job_warranty_status'))?result.getText('custrecord_da_job_warranty_status'):' '
                                });*/

                                i++;
                                return true;
                            }
                        });
                    });
                    var scriptObj = runtime.getCurrentScript();
                    log.debug("Remaining governance units: " + scriptObj.getRemainingUsage());
                }
                context.response.writePage(form);

                form.clientScriptModulePath = './DA_CS_KBB_Receive_Attach.js'
            }else{
              
           /*   var customrecord_da_pending_receiving_kbbSearchObj = search.create({
               type: "customrecord_da_pending_receiving_kbb",
               filters:
               [
                  ["custrecord_da_kbb_user_issuing","is","T"]
               ],
               columns:
               [
                  search.createColumn({name: "internalid", label: "Internal ID"})
               ]
            });
            var searchResultCount = customrecord_da_pending_receiving_kbbSearchObj.runPaged().count;
            log.debug("customrecord_da_pending_receiving_kbbSearchObj result count",searchResultCount);
            customrecord_da_pending_receiving_kbbSearchObj.run().each(function(result){
                record.submitFields({
                            type:'customrecord_da_pending_receiving_kbb',
                            id: result.id,
                            values:{
                                'custrecord_da_kbb_user_issuing': false
                            }
                });
               return true;
            });*/
              var recId = record.create({
                type :'customrecord_da_issue_kbb'
              }).save();
                var numLines = request.getLineCount({
                    group: 'custpage_report_data_sublist'
                });

                for(var i= 0;i< numLines ;i++){
                    var checked = request.getSublistValue({
                        group: 'custpage_report_data_sublist',
                        name : 'custpage_recieve',
                        line: i
                    });

                    if(checked == "T"){
                        var recordId =  request.getSublistValue({
                            group: 'custpage_report_data_sublist',
                            name : 'custpage_org_rec_id',
                            line: i
                        });
                        record.submitFields({
                            type:'customrecord_da_pending_receiving_kbb',
                            id: recordId,
                            values:{
                                'custrecord_da_kbb_user_issuing': true
                            }
                        });
                      var childRec = record.create({type :'customrecord_da_issue_kbb_items'});
                      childRec.setValue('custrecord_da_reference_rec', recordId);
                       childRec.setValue('custrecord_da_issue_kbb_ref', recId);
                      childRec.save();
                    }
                }
              
             record.submitFields({
                type :'customrecord_da_issue_kbb',
                id : recId,
                values :{
                  'custrecord_da_kbb_issuing_to_apple' : false,
                  'custrecord_da_kbb_labor_cost_invoice': '',
                  'custrecord_da_issue_kbb_apple_invoice':'',
                  'custrecord_da_issue_kbb_memo':''
                }
              })

                redirect.toRecord({
                    type : 'customrecord_da_issue_kbb',
                    id : recId 
                });
                
            }           

        } catch (ex) {
            log.error(ex.name, ex.message);
        }

    }

    

    function searchForPendingFullfillmentData(techinicanId, jobcardId, item) {
        var customrecord_da_pending_receiving_kbbSearchObj = search.create({
            type: "customrecord_da_pending_receiving_kbb",
            filters:
                [
                    ["custrecord_da_job_card_transfer_ordr_ref","anyof","1"],"AND",["custrecord_da_kbb_issued","is", true],"AND",["isinactive", "is", false]
                    ],
                    columns:
                        [
                            search.createColumn({name: "custrecord_da_job_card_transfer_ordr_ref", label: "Transfer Order Ref"}),
                            search.createColumn({name: "custrecord_da_kbb_recieve", label: "Recieve"}),
                            search.createColumn({name: "custrecord_job_card_technician", label: "Technician"}),
                            search.createColumn({
                                 name: "custrecord_da_new_part_job_card_kbb",
                                 sort: search.Sort.ASC,
                                 label: "Job Card"
                              }),
                            search.createColumn({name: "custrecord_kbb_job_card_date", label: "Date"}),
                          
                            search.createColumn({name: "custrecord_da_spare_part_ref_kbb", label: "Spare part Ref"}),
                            search.createColumn({name: "custrecord_da_spare_part_item_kbb", label: "Item"}),
                            search.createColumn({name: "custrecord_da_spare_part_kgb_desc", label: "Item Description"}),
                            
                            search.createColumn({name: "custrecord_kbb_item_serialized", label: "Serialized?"}),
                            search.createColumn({name: "custrecord_job_in_warranty_price", label: "In warranty Price"}),
                            search.createColumn({name: "custrecord_da_job_out_of_warranty_price", label: "Out Of Warranty Price"})
                            //search.createColumn({name: "custrecord_da_job_warranty_status", label: "Warranty Status"})
                            ]
        });


        if(techinicanId){
            customrecord_da_pending_receiving_kbbSearchObj.filters.push(search.createFilter({
                "name"    : "custrecord_job_card_technician",
                "operator": "anyof",
                "values"  : techinicanId
            }));
        }

        if(jobcardId){
            customrecord_da_pending_receiving_kbbSearchObj.filters.push(search.createFilter({
                "name"    : "custrecord_da_new_part_job_card_kbb",
                "operator": "anyof",
                "values"  : jobcardId
            }));

        }

        if(item){
            customrecord_da_pending_receiving_kbbSearchObj.filters.push(search.createFilter({
                "name"    : "custrecord_da_spare_part_item_kbb",
                "operator": "anyof",
                "values"  : item
            }));
        }
        var searchResultCount = customrecord_da_pending_receiving_kbbSearchObj.runPaged().count;
        log.debug("invoiceSearchObj result count",searchResultCount);

        var myPagedData = customrecord_da_pending_receiving_kbbSearchObj.runPaged({
            pageSize: 1000
        });
        return myPagedData;

    }

    return {
        onRequest: onRequest
    };

});
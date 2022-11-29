/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope TargetAccount
 */
define(['N/ui/serverWidget', 'N/search', 'N/format', 'N/encode', 'N/file', 'N/record','N/render'],
    function(ui, search, format, encode, file, record, render) {
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
                log.debug('params', (request.parameters));
                if (context.request.method === 'GET') {
                    var form = ui.createForm({
                        title: 'OffSet Leaves Report'
                    });
                    
                    var tab = form.addSubtab({
                        id: 'custpage_tab',
                        label: 'Report'
                    });
                    //Report Sublist            
                      var reportList = form.addSublist({
                        id: 'custpage_report_sublist',
                        type: ui.SublistType.LIST,
                        label: 'Details',
                        tab: 'custpage_tab'
                    });
                    
                    var emp = reportList.addField({
                        id: 'custpage_empname',
                        type: ui.FieldType.TEXT,
                        label: 'Emplyoee'
                    });
                   
                   
                    
                   var phs= reportList.addField({
                        id: 'custpage_noofphs',
                        type: ui.FieldType.TEXT,
                        label: 'No Of PHS'
                    });
                   
                   
                    reportList.addField({
                        id: 'custpage_phstaken',
                        type: ui.FieldType.TEXT,
                        label: 'No Of PHS Taken'
                    });
                    
                    reportList.addField({
                        id: 'custpage_balance',
                        type: ui.FieldType.TEXT,
                        label: 'Balance'
                    });

                    var customrecord_da_holiday_datesSearchObj = search.create({
                       type: "customrecord_da_holiday_dates",
                       filters:
                       [
                          ["custrecord_holiday_date","within","thisyear"]
                       ],
                       columns:
                       [
                          search.createColumn({
                             name: "scriptid",
                             sort: search.Sort.ASC,
                             label: "Script ID"
                          }),
                          search.createColumn({name: "custrecord_holiday_date", label: "Date"}),
                          search.createColumn({name: "custrecord_date_description", label: "Description"})
                       ]
                    });
                    var phssearchResultCount = customrecord_da_holiday_datesSearchObj.runPaged().count;
                    log.debug("customrecord_da_holiday_datesSearchObj result count",phssearchResultCount);
                    customrecord_da_holiday_datesSearchObj.run().each(function(result){
                       // .run().each has a limit of 4,000 results
                       return true;
                    });

                   var customrecord_da_shift_time_sheetSearchObj = search.create({
                       type: "customrecord_da_shift_time_sheet",
                       filters:
                       [
                          ["custrecord_da_time_sheet_type","anyof","2"], 
                          "AND", 
                          ["custrecord_da_time_sheet_date","within","thisyear"]
                       ],
                       columns:
                       [
                          search.createColumn({
                             name: "custrecord_da_time_sheet_employee",
                             summary: "GROUP",
                             label: "Employee"
                          }),
                          search.createColumn({
                             name: "custrecord_da_time_sheet_employee",
                             summary: "COUNT",
                             label: "No of PH Taken"
                          })
                       ]
                    });
                    var searchResultCount = customrecord_da_shift_time_sheetSearchObj.runPaged().count;
                    log.debug("customrecord_da_shift_time_sheetSearchObj result count",searchResultCount);
                    var i = 0;
                    customrecord_da_shift_time_sheetSearchObj.run().each(function(result){
                       var employee = result.getText({
                          name : 'custrecord_da_time_sheet_employee',
                          summary : search.Summary.GROUP
                       });

                       var taken = result.getValue({
                          name : 'custrecord_da_time_sheet_employee',
                          summary : search.Summary.COUNT
                       });

                       taken = (taken)? taken : 0;
                       reportList.setSublistValue({
                         id : 'custpage_empname',
                         value : employee,
                         line : i
                       });
                       reportList.setSublistValue({
                         id : 'custpage_noofphs',
                         value : phssearchResultCount,
                         line : i
                       });

                       reportList.setSublistValue({
                         id : 'custpage_phstaken',
                         value : taken,
                         line : i
                       });

                       reportList.setSublistValue({
                         id : 'custpage_balance',
                         value : parseFloat(phssearchResultCount) - parseFloat(taken),
                         line : i
                       });
                       i++;
                       return true;
                    });
                   
                   
                }
                context.response.writePage(form);
            } 
            catch (ex) {
                log.error(ex.name, ex.message);
            }
        }
                
       
        return {
            onRequest: onRequest
        };
    });
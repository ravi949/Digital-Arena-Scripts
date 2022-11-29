/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope TargetAccount
 */
 var PAGE_SIZE = 50;
define(['N/ui/serverWidget', 'N/search', 'N/format', 'N/encode', 'N/file', 'N/record','N/render'],
    function(ui, search, format, encode, file, record,render) {
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
                  var scriptId = context.request.parameters.script;
            var deploymentId = context.request.parameters.deploy;
                    log.debug("get");
                    var form = ui.createForm({
                        title: 'GL Register'
                    });
                    /*form.addSubmitButton({
                        label: 'Print EXCEL'
                    });*/
                     var tab = form.addSubtab({
                        id: 'custpage_tab',
                        label: 'Report'
                    });
                     
                     var startDateField = form.addField({
                        id: 'custpage_ss_start_date',
                        type: ui.FieldType.DATE,
                        label: 'Start Date',
                        container: 'custpage_tab'
                    });
                    startDateField.updateDisplaySize({
                        height: 250,
                        width: 440
                    });
                    var endDateField = form.addField({
                        id: 'custpage_ss_end_date',
                        type: ui.FieldType.DATE,
                        label: 'End Date',
                        container: 'custpage_tab'
                    });
                    endDateField.updateDisplaySize({
                        height: 250,
                        width: 440
                    }).updateBreakType({
                        breakType: ui.FieldBreakType.STARTCOL
                    });

                  var subsidiaryField = form.addField({
                        id: 'custpage_ss_subsidiary',
                        type: ui.FieldType.SELECT,
                        label: 'GL Subsidiary',
                        source: 'subsidiary',
                        container: 'custpage_tab'
                    }).updateBreakType({
                        breakType: ui.FieldBreakType.STARTCOL
                    });
                    var accountfield = form.addField({
                        id: 'custpage_ss_account',
                        type: ui.FieldType.SELECT,
                        label: 'GL Account',
                        source: 'account',
                        container: 'custpage_tab'
                    });
                    var locationField = form.addField({
                        id: 'custpage_ss_location',
                        type: ui.FieldType.SELECT,
                        label: 'GL Location',
                        source: 'location',
                        container: 'custpage_tab'
                    }).updateBreakType({
                        breakType: ui.FieldBreakType.STARTCOL
                    });
                     var transactionField = form.addField({
                        id: 'custpage_ss_transaction',
                        type: ui.FieldType.SELECT,
                        label: 'GL Ttransaction Type',
                        source: 'transactiontype',
                        container: 'custpage_tab'
                    }).updateBreakType({
                        breakType: ui.FieldBreakType.STARTCOL
                    });
                     var paginationField = form.addField({
                        id: 'custpage_ss_pagination',
                        type: ui.FieldType.SELECT,
                        label: 'Results',
                        container: 'custpage_tab'
                    });
                      
                      var register = form.addSublist({
                        id: 'custpage_report_sublist',
                        type: ui.SublistType.LIST,
                        label: 'Register',
                        tab:'custpage_tab'
                    });
                      var glAccount = register.addField({
                        id: 'custpage_gl_account',
                        type: ui.FieldType.TEXT,
                        label: 'GLAccount'
                    });
                       var glDate = register.addField({
                        id: 'custpage_gl_date',
                        type: ui.FieldType.DATE,
                        label: 'GLDate'
                    });
                        var glMemo = register.addField({
                        id: 'custpage_gl_memo',
                        type: ui.FieldType.TEXT,
                        label: 'GLMemo'
                    });
                         var glLocation = register.addField({
                        id: 'custpage_gl_location',
                        type: ui.FieldType.TEXT,
                        label: 'GL Location'
                    });
                      var glCreatedFrom = register.addField({
                        id: 'custpage_gl_created_from',
                        type: ui.FieldType.TEXT,
                        label: 'GLImpact CreatedFrom'
                    });
                          var gltranType = register.addField({
                        id: 'custpage_gl_tran_type',
                        type: ui.FieldType.TEXT,
                        label: 'GL TransactionType'
                    });
                        var glDepartment = register.addField({
                        id: 'custpage_gl_department',
                        type: ui.FieldType.TEXT,
                        label: 'GL Department'
                    });
                         var glClass = register.addField({
                        id: 'custpage_gl_class',
                        type: ui.FieldType.TEXT,
                        label: 'GL Class'
                    });
                        var glName = register.addField({
                        id: 'custpage_gl_name',
                        type: ui.FieldType.TEXT,
                        label: 'GL Name'
                    });
                       var glDebit = register.addField({
                        id: 'custpage_gl_debit',
                        type: ui.FieldType.CURRENCY,
                        label: 'GL Debit'
                    });
                       var glCredit = register.addField({
                        id: 'custpage_gl_credit',
                        type: ui.FieldType.CURRENCY,
                        label: 'GL Credit'
                    });
                        var glBalance = register.addField({
                        id: 'custpage_gl_balance',
                        type: ui.FieldType.CURRENCY,
                        label: 'GL Balance'
                    });
                         var glCumulativeBal = register.addField({
                        id: 'custpage_gl_cumulative_bal',
                        type: ui.FieldType.CURRENCY,
                        label: 'GL Cumulative Balance'
                    }); 
                        
                var myPagedData1, myPagedData2;
                if (request.parameters.startDate || request.parameters.endDate || request.parameters.subsidiaryId || request.parameters.locationId || request.parameters.transaction ||request.parameters.account) {
                    log.debug('dfgfbxvbbcx');
                    var subsidiaryId = request.parameters.subsidiaryId;
                         log.debug('subsidiaryId',subsidiaryId);
                          subsidiaryField.defaultValue = subsidiaryId;
                          var locationId = request.parameters.locationId;
                          locationField.defaultValue = locationId;
                          var transaction = request.parameters.transaction;
                          transactionField.defaultValue = transaction;
                          var accountId = request.parameters.account;
                          accountfield.defaultValue = accountId;
                         if (request.parameters.endDate != "") {
                          log.debug('hgdfgf');
                            var startTomorrow = new Date(request.parameters.startDate);
                            log.debug('startTomorrow',startTomorrow);
                           // startTomorrow.setDate(startTomorrow.getDate() + 1);
                            
                            var endTomorrow = new Date(request.parameters.endDate);
                            log.debug('endTomorrow',endTomorrow);
                           // endTomorrow.setDate(endTomorrow.getDate() + 1);
                           
                            var startDate = (request.parameters.startDateText);
                            var endDate = (request.parameters.endDateText);
                            var startDateFormat = request.parameters.startDate;
                            log.debug('startDateFormat',startDateFormat);
                            if(startDateFormat)
                            {
                            var dateObj = new Date(startTomorrow);
                            var firstDateString = format.parse({
                                value: startDate,
                                type: format.Type.DATE
                            });
                              log.debug('firstDateString',firstDateString);
                              startDateField.defaultValue = firstDateString;
                          }
                           
                           
                            var endDateFormat = request.parameters.endDate;
                             if(endDateFormat)
                             {
                            var dateObj1 = new Date(endTomorrow);
                            var formattedDateString = format.parse({
                                value: endDate,
                                type: format.Type.DATE
                            });
                                endDateField.defaultValue = formattedDateString;
                          }
                           
                        }
                    myPagedData1 = searchForPendingFullfillmentData(startDate,endDate,request.parameters.subsidiaryId,request.parameters.locationId,request.parameters.transaction,request.parameters.account);
                log.debug('myPagedData1',myPagedData1);
                }else{
                    log.debug('ff;gfv;');
                    myPagedData1 = searchForPendingFullfillmentData();
                }
                //log.audit('myPagedData1', myPagedData1);
                var totalResultCount = myPagedData1.count;

                var listOfPages = myPagedData1["pageRanges"];
                var numberOfPages = listOfPages.length;
                if (numberOfPages > 0) {

                    
                    var page = null;
                        var dataCount = null;
                    var startno = (request.parameters.startno) ? (request.parameters.startno) : 0;
                    //log.audit('listOfPages', listOfPages);
                    for (var i = 0; i < numberOfPages; i++) {
                        var paginationTextEnd = (totalResultCount >= (i * 300) + 300) ? ((i * 300) + 300) : totalResultCount;
                        paginationField.addSelectOption({
                            value: listOfPages[i].index,
                            text: ((i * 300) + 1) + ' to ' + paginationTextEnd + ' of ' + totalResultCount,
                            isSelected: (startno == i)
                        });
                    }

                    page = myPagedData1.fetch({
                        index: startno
                    });

                    dataCount = page.data.length;
                    var totalAmountFromCust = 0;
                    var i = 0;
                    var cumulativeBal =0;
                    myPagedData1.pageRanges.forEach(function(pageRange) {
                        if(myPagedData1.pageRanges.length <= 0)return;
                        var myPage = myPagedData1.fetch({
                            index: (request.parameters.startno) ? (request.parameters.startno) : 0
                        });
                       // log.debug('my page',myPage);
                        //var i = 0;
                        //var arr = [];
                       
                        myPage.data.forEach(function(result) {

                            // log.debug(arr.indexOf(result.id));
                            // log.debug('arr',arr);
                            if(i <= (dataCount- 1)){
                                //arr.push(result.id);
                                 
                                var account = result.getText('custrecord_da_gl_account');
                                //log.debug('account',account);
                        var date = result.getValue('custrecord_da_gl_date');
                        var memo = result.getValue('custrecord_da_gl_memo');
                        var location = result.getText('custrecord_da_gl_location');
                        var createForm = result.getText('custrecord_da_gl_impact_created_from');
                        var transactionType = result.getText('custrecord_da_gl_impact_transaction_type');
                        var department = result.getText('custrecord_da_gl_department');
                        var className = result.getText('custrecord_da_gl_class');
                        var name = result.getValue('custrecord_da_gl_name');
                        var debit =result.getValue('custrecord_da_gl_debit');
                        var credit =result.getValue('custrecord_da_gl_credit');
                          if(account) {
                         register.setSublistValue({
                        id: 'custpage_gl_account',
                        line: i,
                        value:account
                       });
                         //log.debug('amount',amount);
                       }
                       if(date)
                       {
                        register.setSublistValue({
                        id: 'custpage_gl_date',
                        line: i,
                        value:date
                       });
                       }
                       if(memo)
                       {
                        register.setSublistValue({
                        id: 'custpage_gl_memo',
                        line: i,
                        value:memo
                       });
                       }
                       if(location)
                       {
                        register.setSublistValue({
                        id: 'custpage_gl_location',
                        line: i,
                        value:location
                       });
                       }
                       if(createForm)
                       {
                        register.setSublistValue({
                        id: 'custpage_gl_created_from',
                        line: i,
                        value:createForm
                       });
                       }
                       if(transactionType)
                       {
                        register.setSublistValue({
                        id: 'custpage_gl_tran_type',
                        line: i,
                        value:transactionType
                       });
                       }
                        if(department)
                       {
                        register.setSublistValue({
                        id: 'custpage_gl_department',
                        line: i,
                        value:department
                       });
                       }
                       if(className)
                       {
                        register.setSublistValue({
                        id: 'custpage_gl_class',
                        line: i,
                        value:className
                       });
                       }
                       if(name)
                       {
                        register.setSublistValue({
                        id: 'custpage_gl_name',
                        line: i,
                        value:name
                       });
                       }
                       if(debit)
                       {
                        register.setSublistValue({
                        id: 'custpage_gl_debit',
                        line: i,
                        value:debit
                       });
                       }
                       if(credit)
                       {
                        register.setSublistValue({
                        id: 'custpage_gl_credit',
                        line: i,
                        value:credit
                       });
                       }
                       if(debit)
                       {
                        register.setSublistValue({
                        id: 'custpage_gl_balance',
                        line: i,
                        value:debit
                      });
                       }
                       else if(credit)
                       {
                        register.setSublistValue({
                        id: 'custpage_gl_balance',
                        line: i,
                        value:-(credit)
                       });
                       }
                       if(debit)
                       {
                        cumulativeBal = parseFloat(cumulativeBal)+parseFloat(debit);
                       }
                        else if(credit)
                       {
                        cumulativeBal = parseFloat(cumulativeBal)-parseFloat(credit);
                       }
                       register.setSublistValue({
                        id: 'custpage_gl_cumulative_bal',
                        line: i,
                        value:cumulativeBal
                       });
                        
                                i++;
                                return true;
                            }
                        });
                    });
                      }
                       
                       }
             context.response.writePage(form);
              form.clientScriptModulePath = './DA_CS_GL_Register.js';
            } catch (ex) {
                log.error(ex.name, ex.message);
            }
        }
        function searchForPendingFullfillmentData(startDate,endDate,subsidiaryId,locationId,transaction,accountId) {
         var glRegisterSearchObj = search.create({
                            type: "customrecord_da_gl_data_base",
                             
                            columns: [
                                  search.createColumn({
                                    name: "custrecord_da_gl_account",
                                    label: "Account"
                                }),
                                  search.createColumn({
                                    name: "internalid",
                                    label: "id"
                                }),
                              search.createColumn({
                                    name: "custrecord_da_gl_date",
                                    label: "Date"
                                }),
                                search.createColumn({
                                    name: "custrecord_da_gl_memo",
                                    label: "Memo"
                                }),
                                search.createColumn({
                                    name: "custrecord_da_gl_location",
                                    label: "Location"
                                }),
                                search.createColumn({
                                    name: "custrecord_da_gl_impact_created_from",
                                    label: "Created"
                                }),
                                search.createColumn({
                                    name: "custrecord_da_gl_impact_transaction_type",
                                    label: "TransactionType"
                                }),
                                 search.createColumn({
                                    name: "custrecord_da_gl_department",
                                    label: "Department"
                                }),
                                  search.createColumn({
                                    name: "custrecord_da_gl_class",
                                    label: "Class"
                                }),
                                  search.createColumn({
                                    name: "custrecord_da_gl_name",
                                    label: "Name"
                                }),
                                  search.createColumn({
                                    name: "custrecord_da_gl_debit",
                                    label: "Debit"
                                }),
                                  search.createColumn({
                                    name: "custrecord_da_gl_credit",
                                    label: "Credit"
                                })
                            ]
                        });

                        if (subsidiaryId) {
                            var subfil = glRegisterSearchObj.filters.push(search.createFilter({
                                "name": "custrecord_da_gl_subsidiary",
                                "operator": "anyof",
                                "values": subsidiaryId
                            }));
                        }
                        if (transaction) {
                            glRegisterSearchObj.filters.push(search.createFilter({
                                "name": "custrecord_da_gl_impact_transaction_type",
                                "operator": "anyof",
                                "values": transaction
                            }));
                        }
                        if (locationId) {
                            glRegisterSearchObj.filters.push(search.createFilter({
                                "name": "custrecord_da_gl_location",
                                "operator": "anyof",
                                "values": locationId
                            }));
                        }
                        if (endDate&&startDate) {
                            //log.debug('firstDateString', firstDateString);
                            glRegisterSearchObj.filters.push(search.createFilter({
                                "name": "custrecord_da_gl_date",
                                "operator": "within",
                                "values": [startDate, endDate]
                            }));
                        };
                        if (accountId) {
                            //log.debug('firstDateString', firstDateString);
                            glRegisterSearchObj.filters.push(search.createFilter({
                                "name": "custrecord_da_gl_account",
                                "operator": "anyof",
                                "values": accountId
                            }));
                        };
                        var glRegisterSearchObjCount = glRegisterSearchObj.runPaged().count;
                        log.debug("glRegisterSearchObj count", glRegisterSearchObjCount);
                        var myPagedData = glRegisterSearchObj.runPaged({
                    pageSize: 300
                     });
        return myPagedData;
    }

        return {
            onRequest: onRequest
        };
    });
/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope TargetAccount
 */
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
                    var form = ui.createForm({
                        title: 'Vendor Statement'
                    });
                    form.addSubmitButton({
                        label: 'Print PDF'
                    });
                    var tab = form.addSubtab({
                        id: 'custpage_tab',
                        label: 'Functional Currency Report'
                    });
                    /* form.addButton({
                         id: 'custpage_report_btn',
                         label: 'Report',
                         functionName: "openPDFReport(" + request.parameters.buildingId + "," + request.parameters.unitID + ")"
                     });*/
                    //Report Sublist            
                    var reportList = form.addSublist({
                        id: 'custpage_report_sublist',
                        type: ui.SublistType.LIST,
                        label: 'Bills & Payments',
                        tab: 'custpage_tab'
                    });
                    var prepaymentsList = form.addSublist({
                        id: 'custpage_prepayment_sublist',
                        type: ui.SublistType.LIST,
                        label: 'Vendor Prepayemnts',
                        tab: 'custpage_tab'
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
                    }).updateBreakType({
                        breakType: ui.FieldBreakType.STARTCOL
                    });
                    endDateField.updateDisplaySize({
                        height: 250,
                        width: 440
                    });
                    /*.updateLayoutType({
                        layoutType: ui.FieldLayoutType.STARTROW
                    });
                    endDateField.updateDisplaySize({
                        height: 250,
                        width: 440
                    });*/
                  var subsidiaryField = form.addField({
                        id: 'custpage_ss_subsidiary',
                        type: ui.FieldType.SELECT,
                        label: 'Select Subsidiary',
                        source: 'subsidiary',
                        container: 'custpage_tab'
                    }).updateBreakType({
                        breakType: ui.FieldBreakType.STARTCOL
                    });

                   
                    var vendorField = form.addField({
                        id: 'custpage_ss_vendor',
                        type: ui.FieldType.SELECT,
                        label: 'Select Vendor',
                        source: 'vendor',
                        container: 'custpage_tab'
                    }).updateBreakType({
                        breakType: ui.FieldBreakType.STARTCOL
                    });
                    vendorField.updateDisplaySize({
                        height: 250,
                        width: 440
                    });
                    var paginationField = form.addField({
                        id: 'custpage_ss_pagination',
                        type: ui.FieldType.SELECT,
                        label: 'Results',
                        container: 'custpage_tab'
                    }).updateDisplayType({
                        displayType: ui.FieldDisplayType.HIDDEN
                    });
                    /*.updateBreakType({
                        breakType : ui.FieldBreakType.STARTCOL
                    });
                    paginationField.updateDisplaySize({
                        height: 250,
                        width: 140
                    });*/
                    var dateRefField = reportList.addField({
                        id: 'custpage_tran_date',
                        type: ui.FieldType.TEXT,
                        label: '<b>Bills & Payments </b><br/>Date'
                    });
                    var dateField = reportList.addField({
                        id: 'custpage_tran_date_text',
                        type: ui.FieldType.TEXT,
                        label: 'Date'
                    }).updateDisplayType({
                        displayType: ui.FieldDisplayType.HIDDEN
                    });
                    var dateField1 = prepaymentsList.addField({
                        id: 'custpage_vpp_tran_date_text',
                        type: ui.FieldType.TEXT,
                        label: 'Date'
                    }).updateDisplayType({
                        displayType: ui.FieldDisplayType.HIDDEN
                    });
                    var customerfield = reportList.addField({
                        id: 'custpage_account',
                        type: ui.FieldType.TEXT,
                        label: 'Account'
                    }).updateDisplayType({
                        displayType: ui.FieldDisplayType.HIDDEN
                    });
                    prepaymentsList.addField({
                        id: 'custpage_vpp_date',
                        type: ui.FieldType.TEXT,
                        label: '<b>Vendor Prepayments </b><br/>Date'
                    });
                    prepaymentsList.addField({
                        id: 'custpage_vpp_account',
                        type: ui.FieldType.TEXT,
                        label: 'Account'
                    }).updateDisplayType({
                        displayType: ui.FieldDisplayType.HIDDEN
                    });
                    prepaymentsList.addField({
                        id: 'custpage_vpp_type',
                        type: ui.FieldType.TEXT,
                        label: 'Type'
                    });
                    reportList.addField({
                        id: 'custpage_type',
                        type: ui.FieldType.TEXT,
                        label: 'Type'
                    });
                    reportList.addField({
                        id: 'custpage_doc_no',
                        type: ui.FieldType.TEXT,
                        label: 'Document No'
                    });
                    prepaymentsList.addField({
                        id: 'custpage_vpp_doc_no',
                        type: ui.FieldType.TEXT,
                        label: 'Document No'
                    });
                    reportList.addField({
                        id: 'custpage_memo',
                        type: ui.FieldType.TEXT,
                        label: 'Memo'
                    });
                    prepaymentsList.addField({
                        id: 'custpage_vpp_memo',
                        type: ui.FieldType.TEXT,
                        label: 'Memo'
                    });
                    reportList.addField({
                        id: 'custpage_tran_status',
                        type: ui.FieldType.TEXT,
                        label: 'Status'
                    });
                    prepaymentsList.addField({
                        id: 'custpage_vpp_tran_status',
                        type: ui.FieldType.TEXT,
                        label: 'Status'
                    });
                    reportList.addField({
                        id: 'custpage_due_date',
                        type: ui.FieldType.TEXT,
                        label: 'Due Date'
                    }).updateDisplayType({
                        displayType: ui.FieldDisplayType.HIDDEN
                    });
                    prepaymentsList.addField({
                        id: 'custpage_vpp_due_date',
                        type: ui.FieldType.TEXT,
                        label: 'Due Date'
                    }).updateDisplayType({
                        displayType: ui.FieldDisplayType.HIDDEN
                    });
                    reportList.addField({
                        id: 'custpage_amount',
                        type: ui.FieldType.CURRENCY,
                        label: 'Amount'
                    }).updateDisplayType({
                        displayType: ui.FieldDisplayType.HIDDEN
                    });
                    reportList.addField({
                        id: 'custpage_vendor_prepayment_amount',
                        type: ui.FieldType.CURRENCY,
                        label: 'Vendor Prepayment Amount'
                    }).updateDisplayType({
                        displayType: ui.FieldDisplayType.HIDDEN
                    });                    
                    prepaymentsList.addField({
                        id: 'custpage_vpp_vendor_prepayment_amount',
                        type: ui.FieldType.CURRENCY,
                        label: 'Amount'
                    });
                    prepaymentsList.addField({
                        id: 'custpage_applied_amount',
                        type: ui.FieldType.CURRENCY,
                        label: 'Applied Amount'
                    });
                    prepaymentsList.addField({
                        id: 'custpage_remaining_amount',
                        type: ui.FieldType.CURRENCY,
                        label: 'Remaining Amount'
                    });
                    reportList.addField({
                        id: 'custpage_paid',
                        type: ui.FieldType.CURRENCY,
                        label: 'DR'
                    });
                    reportList.addField({
                        id: 'custpage_billed',
                        type: ui.FieldType.CURRENCY,
                        label: 'CR'
                    });
                    reportList.addField({
                        id: 'custpage_balance',
                        type: ui.FieldType.CURRENCY,
                        label: 'Ending Balance'
                    });
                    reportList.addField({
                        id: 'custpage_cf_unapplied_vendor_pp_amount',
                        type: ui.FieldType.CURRENCY,
                        label: 'CF UnApplied Vendor Prepayment Amount'
                    }).updateDisplayType({
                        displayType: ui.FieldDisplayType.HIDDEN
                    });
                    var balance = 0;
                  var subsidiaryId = request.parameters.subsidiaryId;
                          if(!subsidiaryId){
                            subsidiaryId = 1;
                          }
                    var cfVendorPrepaymentAmount = 0;
                    if(request.parameters.currency){
                        currencyField.defaultValue = request.parameters.currency;
                    }

                    var subsidiaryId = request.parameters.subsidiaryId;
                          if(!subsidiaryId){
                            subsidiaryId = 1;
                          }
                          subsidiaryField.defaultValue = subsidiaryId;
                    if (request.parameters.startDate || request.parameters.vendorId || request.parameters.endDate) {
                        // log.debug('params');
                        var firstDateString;
                        vendorField.defaultValue = request.parameters.vendorId;
                        if (request.parameters.endDate != "") {
                            //log.debug('sd', new Date(request.parameters.startDate));
                            var startTomorrow = new Date(request.parameters.startDate);
                            //startTomorrow.setDate(startTomorrow.getDate() + 1);
                            startDateField.defaultValue = startTomorrow;
                            var endTomorrow = new Date(request.parameters.endDate)
                            // endTomorrow.setDate(endTomorrow.getDate() + 1)
                            endDateField.defaultValue = endTomorrow;
                            var startDate = (request.parameters.startDateText);
                            var endDate = (request.parameters.endDateText);
                            //    log.debug('startDate', startDate);
                            var startDateFormat = request.parameters.startDate;
                            //  log.debug('startDateFormat', startDateFormat);
                            var dateObj = new Date(startDateFormat);
                            //log.debug('dateObj', dateObj);
                            var formattedDateString = format.format({
                                value: dateObj,
                                type: format.Type.DATE
                            });
                            //log.debug('formattedDateString', formattedDateString);
                            var firstDate = new Date("01/01/2015");
                            firstDateString = format.format({
                                value: firstDate,
                                type: format.Type.DATE
                            });
                            //log.debug('firstDateString', firstDateString);
                        }
                        var vendorId = request.parameters.vendorId;
                       
                        var transactionSearchObj = search.create({
                            type: "transaction",
                            filters: [
                                ["mainline", "is", "T"], "AND",
                                [
                                    [
                                        ["type", "anyof", "Journal"], "AND", ["accounttype", "anyof", "AcctPay"],"AND",['subsidiary', 'anyof', subsidiaryId]
                                    ], "OR", ["type", "anyof", "VendBill", "VendCred", "VendPymt", "VPrepApp", "FxReval"],"AND",['subsidiary', 'anyof', subsidiaryId]
                                ]
                            ],
                            columns: [
                                search.createColumn({
                                    name: "amount",
                                    summary: "SUM",
                                    label: "Amount"
                                })
                            ]
                        });
                        var searchResultCount = transactionSearchObj.runPaged().count;
                        log.debug("transactionSearchObj result count", searchResultCount);
                        if (vendorId) {
                            transactionSearchObj.filters.push(search.createFilter({
                                "name": "name",
                                "operator": "anyof",
                                "values": vendorId
                            }));
                        }
                        if (request.parameters.currency) {
                            transactionSearchObj.filters.push(search.createFilter({
                                "name": "currency",
                                "operator": "anyof",
                                "values": request.parameters.currency
                            }));
                        }
                        if (request.parameters.endDate != "") {
                            //log.debug('firstDateString', firstDateString);
                            transactionSearchObj.filters.push(search.createFilter({
                                "name": "trandate",
                                "operator": "within",
                                "values": [firstDateString, formattedDateString]
                            }));
                        };
                        transactionSearchObj.run().each(function(result) {
                            balance = -(result.getValue({
                                name: 'amount',
                                summary: search.Summary.SUM
                            }));
                            if (balance == undefined || balance == '' || balance == null) {
                                balance = 0;
                            }
                            return true;
                        });
                        var vendorprepaymentSearchObj = search.create({
                            type: "transaction",
                            filters: [
                                ["type", "anyof", "VPrep"],
                                "AND",
                                ["status", "anyof", "VPrep:B"],
                                "AND",
                                ["mainline", "is", "T"]
                            ],
                            columns: [
                                search.createColumn({
                                    name: "amount",
                                    summary: "SUM",
                                    label: "Amount"
                                })
                            ]
                        });
                        var searchResultCount = vendorprepaymentSearchObj.runPaged().count;
                        log.debug("vendorprepaymentSearchObj result count",searchResultCount);
                        if (vendorId) {
                            vendorprepaymentSearchObj.filters.push(search.createFilter({
                                "name": "name",
                                "operator": "anyof",
                                "values": vendorId
                            }));
                        }
                      if(request.parameters.subsidiaryId){
                        log.debug('filetr adding', subsidiaryId);
                         vendorprepaymentSearchObj.filters.push(search.createFilter({
                                "name": "subsidiary",
                                "operator": "anyof",
                                "values": subsidiaryId
                            }));
                      }
                      if (request.parameters.currency) {
                            vendorprepaymentSearchObj.filters.push(search.createFilter({
                                "name": "currency",
                                "operator": "anyof",
                                "values": request.parameters.currency
                            }));
                        }

                       var searchResultCount = vendorprepaymentSearchObj.runPaged().count;
                        log.debug("vendorprepaymentSearchObj result count",searchResultCount);
                        if (request.parameters.endDate != "") {
                            log.debug('firstDateString', firstDateString);
                            vendorprepaymentSearchObj.filters.push(search.createFilter({
                                "name": "trandate",
                                "operator": "within",
                                "values": [firstDateString, formattedDateString]
                            }));
                        };
                        vendorprepaymentSearchObj.run().each(function(result) {
                            cfVendorPrepaymentAmount = -(result.getValue({
                                name: 'amount',
                                summary: search.Summary.SUM
                            }));
                            if (cfVendorPrepaymentAmount == undefined || cfVendorPrepaymentAmount == '' || cfVendorPrepaymentAmount == null) {
                                cfVendorPrepaymentAmount = 0;
                            }
                            return true;
                        });
                        if (request.parameters.endDate == "") {
                            balance = 0;
                            cfVendorPrepaymentAmount = 0;
                        }
                        /*if(!request.parameters.unitID){
                            var myPagedData1 = searchforContractsWithBuildingId(request.parameters.buildingId,request.parameters.status);
                         */
                        // var myPagedData1 = functioncallingwithparams(request.parameters.vendorId, startDate, endDate);
                    } else {
                        var myPagedData1 = functioncallingwithoutparams();
                    }
                    reportList.setSublistValue({
                        id: 'custpage_tran_date',
                        line: 0,
                        value: "<b>Opening </b>"
                    });
                    reportList.setSublistValue({
                        id: 'custpage_balance',
                        line: 0,
                        value: balance
                    });
                    reportList.setSublistValue({
                        id: 'custpage_cf_unapplied_vendor_pp_amount',
                        line: 0,
                        value: cfVendorPrepaymentAmount
                    });
                    //log.audit('myPagedData1', myPagedData1);                    
                    var currentAmount = 0;
                    var arr = [];
                    var i = 1;
                    // log.audit('dataCount', dataCount);VendPymt
                    var transactionSearchObj = search.create({
                        type: "transaction",
                        filters: [
                            ["mainline", "is", "T"],
                            "AND",
                            [
                                [
                                    ["type", "anyof", "Journal"], "AND", ["accounttype", "anyof", "AcctPay"],"AND",['subsidiary', 'anyof', subsidiaryId]
                                ], "OR", ["type", "anyof", "VendBill", "VendCred", "VendPymt", "VPrepApp", "FxReval"],"AND",['subsidiary', 'anyof', subsidiaryId]
                            ]
                        ],
                        columns: [
                            search.createColumn({
                                name: "internalid",
                                label: "Internal ID"
                            }),
                            search.createColumn({
                                name: "account",
                                label: "Account"
                            }),
                            search.createColumn({
                                name: "type",
                                label: "Type"
                            }),
                            search.createColumn({
                                name: "trandate",
                                sort: search.Sort.ASC,
                                label: "Date"
                            }),
                            search.createColumn({
                                name: "tranid",
                                label: "Document Number"
                            }),
                            search.createColumn({
                                name: "statusref",
                                label: "Status"
                            }),
                            search.createColumn({
                                name: "duedate",
                                label: "Due Date/Receive By"
                            }),
                            search.createColumn({
                                name: "entity",
                                label: "Name"
                            }),
                            search.createColumn({
                                name: "postingperiod",
                                label: "Period"
                            }),
                            search.createColumn({
                                name: "custbody_da_realised_gain_loss",
                                label: "GL"
                            }),
                            
                            search.createColumn({
                                name: "amount",
                                label: "Amount"
                            }),
                            search.createColumn({
                                name: "memo",
                                label: "Memo"
                            }),
                            search.createColumn({
                                name: "creditamount",
                                label: "Amount (Credit)"
                            }),
                            search.createColumn({
                                name: "debitamount",
                                label: "Amount (Debit)"
                            }),
                            search.createColumn({
                                name: 'custbody_da_vp_unapplied_amount',
                                label: 'Unapplied Amount'
                            }),
                            search.createColumn({name: "currency", label: "Currency"}),
      search.createColumn({name: "exchangerate", label: "Exchange Rate"})
                        ]
                    });
                    if (vendorId) {
                        transactionSearchObj.filters.push(search.createFilter({
                            "name": "name",
                            "operator": "anyof",
                            "values": vendorId
                        }));
                    }
                    if (startDate) {
                        transactionSearchObj.filters.push(search.createFilter({
                            "name": "trandate",
                            "operator": "within",
                            "values": [startDate, endDate]
                        }));
                    }
                    var currencyVal = request.parameters.currency;
                    log.debug('currencyVal',currencyVal);
                    if (request.parameters.currency) {
                            transactionSearchObj.filters.push(search.createFilter({
                                "name": "currency",
                                "operator": "anyof",
                                "values": request.parameters.currency
                            }));
                        }

                    var searchResultCount = transactionSearchObj.runPaged().count;
                    log.error("transactionSearchObj result count", searchResultCount);
                    transactionSearchObj.run().each(function(result) {
                        var date = result.getValue({
                            name: 'trandate'
                        });
                        //  log.audit('contractNO',contractNO);
                        var customerName = result.getText({
                            name: 'custrecordda_customer'
                        });
                        var account = result.getText({
                            name: 'account'
                        });
                        var type = result.getText({
                            name: 'type'
                        });
                        log.debug('type',type);
                        var docNo = result.getValue({
                            name: 'tranid'
                        });
                        var status = result.getValue({
                            name: 'statusref'
                        });
                        var dueDate = result.getValue({
                            name: 'duedate'
                        });
                        var id = result.getValue({
                            name: 'internalid'
                        });

                        var exchangeRate = result.getValue('exchangerate');
                        var create = true;
                        if (id) {
                            if (contains(arr, id)) {
                                create = true
                            }
                        } else {
                            create = true
                        }
                        //log.debug('i', i + "id" + result.id);
                        var typeText;
                        if (type == "Journal") {
                            typeText = "journal"
                        }
                        if (type == "Bill Payment") {
                            typeText = "vendpymt"
                        }
                        if (type == "Bill") {
                            typeText = "vendbill"
                        }
                        if (type == "Bill Credit") {
                            typeText = "vendcred"
                        }
                        if (type == "Vendor Prepayment") {
                            typeText = "vprep"
                        }
                        if (type == "Vendor Prepayment Application") {
                            typeText = "vprepapp"
                        }

                        if (create) {
                            /*if(type == "Vendor Prepayment"){
                                 prepaymentsList.setSublistValue({
                                     id: 'custpage_vpp_date',
                                     line: i,
                                     value: "<html><style type='text/css'>a { text-decoration:none; }</style><a href=/app/accounting/transactions/" + typeText + ".nl?id=" + result.id + "&whence=><font color='#255599'>" + date + "</font></a></html>"
                                 });
                             }*/
                            reportList.setSublistValue({
                                id: 'custpage_tran_date',
                                line: i,
                                value: "<html><style type='text/css'>a { text-decoration:none; }</style><a href=/app/accounting/transactions/" + typeText + ".nl?id=" + result.id + "&whence=><font color='#255599'>" + date + "</font></a></html>"
                            });
                            //}
                            reportList.setSublistValue({
                                id: 'custpage_tran_date_text',
                                line: i,
                                value: date
                            });
                            //  log.debug('date', date);
                            reportList.setSublistValue({
                                id: 'custpage_type',
                                line: i,
                                value: type
                            });
                            reportList.setSublistValue({
                                id: 'custpage_account',
                                line: i,
                                value: account
                            });
                            var memo = result.getValue('memo');
                            if (memo) {
                                reportList.setSublistValue({
                                    id: 'custpage_memo',
                                    line: i,
                                    value: memo
                                });
                            }
                            // log.debug('account', account);
                            if (docNo) {
                                reportList.setSublistValue({
                                    id: 'custpage_doc_no',
                                    line: i,
                                    value: docNo
                                });
                            }
                            if (status) {
                                reportList.setSublistValue({
                                    id: 'custpage_tran_status',
                                    line: i,
                                    value: status
                                });
                            }
                            //   log.debug('status', status);
                            if (dueDate) {
                                reportList.setSublistValue({
                                    id: 'custpage_due_date',
                                    line: i,
                                    value: dueDate
                                });
                            }
                            reportList.setSublistValue({
                                id: 'custpage_amount',
                                line: i,
                                value: result.getValue('amount')
                            });
                            if (type == "Bill" ) {
                                currentAmount = -(result.getValue('amount'));
                                if(type == "Vendor Prepayment Application"){
                                    currentAmount = -(currentAmount);
                                }
                                reportList.setSublistValue({
                                    id: 'custpage_billed',
                                    line: i,
                                    value: result.getValue('amount')
                                });
                            }
                            var gainLossAmount = 0;
                            if (type == "Bill Payment" || type == "Bill Credit" || type == "Vendor Prepayment Application") {
                               
                              
                              if (type == "Bill Payment"){
                                var vendorpaymentSearchObj = search.create({
                                                       type: "vendorpayment",
                                                       filters:
                                                       [
                                                          ["mainline","is","F"], 
                                                          "AND", 
                                                          ["type","anyof","VendPymt"], 
                                                          "AND", 
                                                          ["account","anyof","2077"],"AND",["internalid", "anyof", id]
                                                       ],
                                                       columns:
                                                       [
                                                          search.createColumn({
                                                             name: "amount",
                                                             summary: "SUM",
                                                             label: "Amount"
                                                          })
                                                       ]
                                                    });
                                                    var searchResultCount = vendorpaymentSearchObj.runPaged().count;
                                                    log.debug("vendorpaymentSearchObj result count",searchResultCount);
                                                    vendorpaymentSearchObj.run().each(function(result){
                                                      gainLossAmount = result.getValue({
                                                        name :'amount',
                                                        summary : search.Summary.SUM
                                                      });
                                                       return true;
                                                    });
                                log.debug('gainLossAmount', gainLossAmount);
                              }
                              
                              gainLossAmount = (gainLossAmount) ? gainLossAmount: 0;
                                reportList.setSublistValue({
                                    id: 'custpage_paid',
                                    line: i,
                                    value: -(parseFloat(result.getValue('amount')) + parseFloat(gainLossAmount))
                                });
                               currentAmount = -(parseFloat(result.getValue('amount')) + parseFloat(gainLossAmount));
                            }
                            if (type == "Journal") {
                                if (contains(arr, id)) {
                                  log.debug('ifff');
                                   // currentAmount = 0;
                                  currentAmount = -(result.getValue('amount'));
                                  reportList.setSublistValue({
                                        id: 'custpage_billed',
                                        line: i,
                                        value: (result.getValue('amount'))
                                    });
                                } else {
                                   log.debug('elseeee');
                                    arr.push(id);
                                    currentAmount = -(result.getValue('amount'));
                                    reportList.setSublistValue({
                                        id: 'custpage_billed',
                                        line: i,
                                        value: (result.getValue('amount'))
                                    });
                                }
                               /* if (contains(arr, id)) {
                                    currentAmount = 0;
                                } else {
                                    arr.push(id);
                                    currentAmount = -(result.getValue('amount'));
                                    reportList.setSublistValue({
                                        id: 'custpage_billed',
                                        line: i,
                                        value: (result.getValue('amount'))
                                    });
                                }*/
                            }
                            reportList.setSublistValue({
                                id: 'custpage_cf_unapplied_vendor_pp_amount',
                                line: i,
                                value: 0
                            });
                            if (type == "Vendor Prepayment") {
                                if (status == "paid") {
                                    var value = -(result.getValue('amount'));
                                    cfVendorPrepaymentAmount = parseFloat(cfVendorPrepaymentAmount) + parseFloat(value);
                                    reportList.setSublistValue({
                                        id: 'custpage_cf_unapplied_vendor_pp_amount',
                                        line: i,
                                        value: cfVendorPrepaymentAmount
                                    });
                                }
                                if (status == "partiallyApplied") {
                                    var value = (result.getValue('custbody_da_vp_unapplied_amount'));
                                    cfVendorPrepaymentAmount = parseFloat(cfVendorPrepaymentAmount) + parseFloat(value);
                                    reportList.setSublistValue({
                                        id: 'custpage_cf_unapplied_vendor_pp_amount',
                                        line: i,
                                        value: cfVendorPrepaymentAmount
                                    });
                                }
                                reportList.setSublistValue({
                                    id: 'custpage_vendor_prepayment_amount',
                                    line: i,
                                    value: -(result.getValue('amount'))
                                });
                                currentAmount = 0;
                            }
                            reportList.setSublistValue({
                                id: 'custpage_cf_unapplied_vendor_pp_amount',
                                line: i,
                                value: cfVendorPrepaymentAmount
                            });
                            //log.audit('amount', type + "  value " + currentAmount);
                            balance = parseFloat(balance) + parseFloat(currentAmount);
                            reportList.setSublistValue({
                                id: 'custpage_balance',
                                line: i,
                                value: balance.toFixed(2)
                            });
                        }
                        i++;
                        return true;
                    });
////Currency Revaluation.....
                    var currencyTransactionSearchObj = search.create({
                        type: "transaction",
                        filters: [
                            ["type", "anyof", "FxReval"],"AND",['subsidiary', 'anyof', subsidiaryId]
                            ],
                        columns: [
                            search.createColumn({
                                name: "internalid",
                                label: "Internal ID"
                            }),
                            search.createColumn({
                                name: "account",
                                label: "Account"
                            }),
                            search.createColumn({
                                name: "type",
                                label: "Type"
                            }),
                            search.createColumn({
                                name: "trandate",
                                sort: search.Sort.ASC,
                                label: "Date"
                            }),
                            search.createColumn({
                                name: "tranid",
                                label: "Document Number"
                            }),
                            search.createColumn({
                                name: "statusref",
                                label: "Status"
                            }),
                            search.createColumn({
                                name: "duedate",
                                label: "Due Date/Receive By"
                            }),
                            search.createColumn({
                                name: "entity",
                                label: "Name"
                            }),
                            search.createColumn({
                                name: "postingperiod",
                                label: "Period"
                            }),
                            search.createColumn({
                                name: "custbody_da_realised_gain_loss",
                                label: "GL"
                            }),
                            
                            search.createColumn({
                                name: "amount",
                                label: "Amount"
                            }),
                            search.createColumn({
                                name: "memo",
                                label: "Memo"
                            }),
                            search.createColumn({
                                name: "creditamount",
                                label: "Amount (Credit)"
                            }),
                            search.createColumn({
                                name: "debitamount",
                                label: "Amount (Debit)"
                            }),
                            search.createColumn({
                                name: "currency",
                                label: "Currency"
                             }),
                            search.createColumn({
                                name: "exchangerate",
                                label: "Exchange Rate"
                            })
                        ]
                    });
                    if (vendorId) {
                        currencyTransactionSearchObj.filters.push(search.createFilter({
                            "name": "name",
                            "operator": "anyof",
                            "values": vendorId
                        }));
                    }
                    if (startDate) {
                        currencyTransactionSearchObj.filters.push(search.createFilter({
                            "name": "trandate",
                            "operator": "within",
                            "values": [startDate, endDate]
                        }));
                    }
                    var currencyVal = request.parameters.currency;
                    log.debug('currencyVal',currencyVal);
                    if (request.parameters.currency) {
                            currencyTransactionSearchObj.filters.push(search.createFilter({
                                "name": "currency",
                                "operator": "anyof",
                                "values": request.parameters.currency
                            }));
                        }

                    var searchResultCount = currencyTransactionSearchObj.runPaged().count;
                    log.error("currencyTransactionSearchObj result count", searchResultCount);
                    currencyTransactionSearchObj.run().each(function(result) {
                        var date = result.getValue({
                            name: 'trandate'
                        });
                        log.debug('date',date);
                        var customerName = result.getText({
                            name: 'custrecordda_customer'
                        });
                        log.debug('customerName',customerName);
                        var account = result.getText({
                            name: 'account'
                        });
                        log.debug('account',account);
                        var type = result.getText({
                            name: 'type'
                        });
                        log.debug('type',type);
                        var docNo = result.getValue({
                            name: 'tranid'
                        });
                        log.debug('docNo',docNo);
                        var status = result.getValue({
                            name: 'statusref'
                        });
                        log.debug('status',status);
                        var dueDate = result.getValue({
                            name: 'duedate'
                        });
                        log.debug('dueDate',dueDate);
                        var id = result.getValue({
                            name: 'internalid'
                        });
                        log.debug('id',id);

                        var exchangeRate = result.getValue('exchangerate');
                        log.debug('exchangeRate',exchangeRate);
                        var debitAmt = result.getValue('debitamount');
                        log.debug('debitAmt',debitAmt);
                        var creditAmt = result.getValue('creditamount');
                        log.debug('creditAmt',creditAmt);
                        var amount = result.getValue('amount');
                        log.debug('amount',amount);
                       reportList.setSublistValue({
                                id: 'custpage_tran_date',
                                line: i,
                                value: "<html><style type='text/css'>a { text-decoration:none; }</style><a href=/app/accounting/transactions/" + "fxreval" + ".nl?id=" + result.id + "&whence=><font color='#255599'>" + date + "</font></a></html>"
                            });
                            reportList.setSublistValue({
                                id: 'custpage_tran_date_text',
                                line: i,
                                value: date
                            });
                            reportList.setSublistValue({
                                id: 'custpage_type',
                                line: i,
                                value: type
                            });
                            reportList.setSublistValue({
                                id: 'custpage_account',
                                line: i,
                                value: account
                            });
                            var memo = result.getValue('memo');
                            if (memo) {
                                reportList.setSublistValue({
                                    id: 'custpage_memo',
                                    line: i,
                                    value: memo
                                });
                            }
                            if (docNo) {
                                reportList.setSublistValue({
                                    id: 'custpage_doc_no',
                                    line: i,
                                    value: docNo
                                });
                            }
                            if (status) {
                                reportList.setSublistValue({
                                    id: 'custpage_tran_status',
                                    line: i,
                                    value: status
                                });
                            }
                            if (dueDate) {
                                reportList.setSublistValue({
                                    id: 'custpage_due_date',
                                    line: i,
                                    value: dueDate
                                });
                            }
                            if(amount){
                                reportList.setSublistValue({
                                id: 'custpage_amount',
                                line: i,
                                value: amount
                            });
                            }
                            if(debitAmt){
                            reportList.setSublistValue({
                                id: 'custpage_paid',
                                line: i,
                                value: debitAmt
                            });
                            balance = parseFloat(balance) + parseFloat(debitAmt);
                            }
                            if(creditAmt){
                            reportList.setSublistValue({
                                id: 'custpage_billed',
                                line: i,
                                value: creditAmt
                            });
                            balance = parseFloat(balance) - parseFloat(creditAmt);
                            }
                            reportList.setSublistValue({
                                id: 'custpage_balance',
                                line: i,
                                value: balance.toFixed(2)
                            });
                            i++;
                            return true;
                        });
                    reportList.setSublistValue({
                        id: 'custpage_tran_date',
                        line: i,
                        value: "<b>Ending Balance</b>"
                    });
                    reportList.setSublistValue({
                        id: 'custpage_cf_unapplied_vendor_pp_amount',
                        line: i,
                        value: cfVendorPrepaymentAmount
                    });
                    reportList.setSublistValue({
                        id: 'custpage_balance',
                        line: i,
                        value: balance.toFixed(2)
                    });

                    

                    //vendor prepayments
                    var i = 0;
                    var Remaining = 0;
                    if (vendorId) {
                        var transactionSearchObj = search.create({
                            type: "transaction",
                            filters: [
                                ["mainline", "is", "T"],
                                "AND",
                                ["type", "anyof", "VPrep"],
                                "AND",
                                ["name", "anyof", vendorId]
                            ],
                            columns: [
                                search.createColumn({
                                    name: "internalid",
                                    label: "Internal ID"
                                }),
                                search.createColumn({
                                    name: "account",
                                    label: "Account"
                                }),
                                search.createColumn({
                                    name: "type",
                                    label: "Type"
                                }),
                                search.createColumn({
                                    name: "trandate",
                                    sort: search.Sort.ASC,
                                    label: "Date"
                                }),
                                search.createColumn({
                                    name: "tranid",
                                    label: "Document Number"
                                }),
                                search.createColumn({
                                    name: "statusref",
                                    label: "Status"
                                }),
                                search.createColumn({
                                    name: "custbody_da_realised_gain_loss",
                                    label: "Relaized Gain/Loss"
                                }),
                                 search.createColumn({
                                    name: "duedate",
                                    label: "Due Date/Receive By"
                                }),
                                search.createColumn({
                                    name: "entity",
                                    label: "Name"
                                }),
                                search.createColumn({
                                    name: "postingperiod",
                                    label: "Period"
                                }),
                                search.createColumn({
                                    name: "amount",
                                    label: "Amount"
                                }),
                                search.createColumn({
                                    name: "memo",
                                    label: "Memo"
                                }),
                                search.createColumn({
                                    name: "creditamount",
                                    label: "Amount (Credit)"
                                }),
                                search.createColumn({
                                    name: "debitamount",
                                    label: "Amount (Debit)"
                                }),
                                search.createColumn({
                                    name: 'custbody_da_vp_unapplied_amount',
                                    label: 'Unapplied Amount'
                                }),
                                search.createColumn({name: "currency", label: "Currency"}),
                                search.createColumn({name: "exchangerate", label: "Exchange Rate"})
                            ]
                        });
                      if(request.parameters.subsidiaryId){
                        log.debug('filetr adding', subsidiaryId);
                         transactionSearchObj.filters.push(search.createFilter({
                                "name": "subsidiary",
                                "operator": "anyof",
                                "values": request.parameters.subsidiaryId
                            }));
                      }
                      if (request.parameters.currency) {
                            transactionSearchObj.filters.push(search.createFilter({
                                "name": "currency",
                                "operator": "anyof",
                                "values": request.parameters.currency
                            }));
                        }
                        var searchResultCount = transactionSearchObj.runPaged().count;
                        log.error("transactionSearchObj result count", searchResultCount);
                        transactionSearchObj.run().each(function(result) {
                            var date = result.getValue({
                                name: 'trandate'
                            });
                            //  log.audit('contractNO',contractNO);
                            var customerName = result.getText({
                                name: 'custrecordda_customer'
                            });
                            var account = result.getText({
                                name: 'account'
                            });
                            var type = result.getText({
                                name: 'type'
                            });
                            var docNo = result.getValue({
                                name: 'tranid'
                            });
                            var status = result.getValue({
                                name: 'statusref'
                            });
                            var dueDate = result.getValue({
                                name: 'duedate'
                            });
                            var id = result.getValue({
                                name: 'internalid'
                            });
                            var exchangeRate = result.getValue('exchangerate');
                            var create = true;
                            //log.debug('i', i + "id" + result.id);
                            var typeText;
                            if (type == "Vendor Prepayment") {
                                typeText = "vprep"
                            }
                            if (create) {
                                prepaymentsList.setSublistValue({
                                    id: 'custpage_vpp_date',
                                    line: i,
                                    value: "<html><style type='text/css'>a { text-decoration:none; }</style><a href=/app/accounting/transactions/" + typeText + ".nl?id=" + result.id + "&whence=><font color='#255599'>" + date + "</font></a></html>"
                                });
                                prepaymentsList.setSublistValue({
                                    id: 'custpage_vpp_tran_date_text',
                                    line: i,
                                    value: date
                                });
                                prepaymentsList.setSublistValue({
                                    id: 'custpage_vpp_type',
                                    line: i,
                                    value: type
                                });
                                prepaymentsList.setSublistValue({
                                    id: 'custpage_vpp_account',
                                    line: i,
                                    value: account
                                });
                                var memo = result.getValue('memo');
                                if (memo) {
                                    prepaymentsList.setSublistValue({
                                        id: 'custpage_vpp_memo',
                                        line: i,
                                        value: memo
                                    });
                                }
                                if (docNo) {
                                    prepaymentsList.setSublistValue({
                                        id: 'custpage_vpp_doc_no',
                                        line: i,
                                        value: docNo
                                    });
                                }
                                // log.debug('account', account);
                                if (status) {
                                    prepaymentsList.setSublistValue({
                                        id: 'custpage_vpp_tran_status',
                                        line: i,
                                        value: status
                                    });
                                }
                                //   log.debug('status', status);
                                if (dueDate) {
                                    prepaymentsList.setSublistValue({
                                        id: 'custpage_vpp_due_date',
                                        line: i,
                                        value: dueDate
                                    });
                                }
                                if (type == "Vendor Prepayment") {
                                    prepaymentsList.setSublistValue({
                                        id: 'custpage_vpp_vendor_prepayment_amount',
                                        line: i,
                                        value: -(result.getValue('amount'))
                                    });
                                    if (status == "paid") {
                                        var value = -(result.getValue('amount'))
                                        // cfVendorPrepaymentAmount = parseFloat(cfVendorPrepaymentAmount) + parseFloat(value);
                                        prepaymentsList.setSublistValue({
                                            id: 'custpage_vpp_vendor_prepayment_amount',
                                            line: i,
                                            value: -(result.getValue('amount'))
                                        });
                                        Remaining = parseFloat(Remaining) + parseFloat(value);
                                    }
                                    if (status == "applied") {
                                        prepaymentsList.setSublistValue({
                                            id: 'custpage_applied_amount',
                                            line: i,
                                            value: -(result.getValue('amount'))
                                        });
                                    }
                                    if (status == "partiallyApplied") {
                                        var total = -(result.getValue('amount'));
                                        var value = (result.getValue('custbody_da_vp_unapplied_amount'));
                                        var appliedAmount = parseFloat(total) - parseFloat(value);
                                        prepaymentsList.setSublistValue({
                                            id: 'custpage_applied_amount',
                                            line: i,
                                            value: appliedAmount.toFixed(2)
                                        });
                                        Remaining = parseFloat(Remaining) + parseFloat(value);
                                    }
                                    prepaymentsList.setSublistValue({
                                        id: 'custpage_remaining_amount',
                                        line: i,
                                        value: Remaining
                                    });
                                }                                
                            }
                            i++;
                            return true;
                        });
                    }

                     prepaymentsList.setSublistValue({
                                    id: 'custpage_vpp_date',
                                    line: i,
                                    value: '<b>Ending Balance</b>'
                                });
                      prepaymentsList.setSublistValue({
                                    id: 'custpage_remaining_amount',
                                    line: i,
                                    value: Remaining.toFixed(2)
                                });

                    var endingBalance = parseFloat(Remaining) + parseFloat(balance);
                     prepaymentsList.setSublistValue({
                                    id: 'custpage_vpp_date',
                                    line: i+1,
                                    value: '<b>Net Balance</b>'
                                });
                      prepaymentsList.setSublistValue({
                                    id: 'custpage_remaining_amount',
                                    line: i+1,
                                    value: endingBalance.toFixed(2)
                                });
                } else {
                   var totalAmount =0;
                    log.debug('params', request.parameters);
                    var startDate = request.parameters.custpage_ss_start_date;
                    var endDate = request.parameters.custpage_ss_end_date;
                    var vendor = request.parameters.custpage_ss_vendor;
                    var subsidiaryId =  request.parameters.custpage_ss_subsidiary;
                    //var subsidiary = request.parameters.custpage_ss_subsidiary;
                    //log.debug('subsidiaryid',subsidiary)
                    vendor = record.load({
                        type: 'vendor',
                        id: vendor
                    });
                 var vendorId = vendor.getValue('entityid');
                  var vendorName =vendor.getText('altname');
                 var address = vendor.getText("defaultaddress");
                  var taxNo =vendor.getText("vatregnumber");
                   var currency = vendor.getText("currency");
                  var vendorFullName = vendorId;
                    log.debug('startDate', startDate);
                    log.debug('endDate', endDate);
                    log.debug('vendor', vendor);
                    var subsidiaryRec = record.load({
                        type:'subsidiary',
                        id:subsidiaryId
                    });
                    var image = subsidiaryRec.getValue('logo');
                   var fileObj = file.load({
                        id: image
                    });

                    log.debug('fileObj', fileObj.url);
                    var numLines = request.getLineCount({
                        group: 'custpage_report_sublist'
                    });
                    log.debug('numLines', numLines);
                  var date = new Date().getDate() +"/"+ (parseFloat(new Date().getMonth())+parseFloat(1))+"/"+ new Date().getFullYear();
                   var xml = '<?xml version=\"1.0\"?><pdf><head>'+
    '<link name="NotoSansArabic" type="font" subtype="opentype" src="${nsfont.NotoSansArabic_Regular}" src-bold="${nsfont.NotoSansArabic_Bold}" bytes="2" subset="false"/>'+
     '<macrolist><macro id=\"nlheader\">    <table class=\"header\" style=\"width: 100%;\"><tr>  <td><img src= "'+fileObj.url+'"  align="left" width="160px" height="80px"/></td>'+
    '<td align=\"right\"><span class=\"title\">Vendor Statement</span></td>   </tr><tr><td colspan="2" align=\"right\"><b> '+date+'</b></td></tr></table></macro>'+
    '<macro id="nlfooter"><table class="footer" margin-top="40px"><tr><td width="450px"></td><td ><p align="center"><pagenumber/> of <totalpages/></p></td></tr></table></macro></macrolist>'+
    '<style type=\"text/css\">*{font-family: NotoSansArabic, sans-serif;}table { font-size: 9pt; table-layout: fixed; } th { font-weight: bold; font-size: 8pt; vertical-align: middle; padding: 5px 6px 3px; background-color: #e3e3e3; color: #333333; } td { padding: 4px 6px; } td p { align:left } b { font-weight: bold; color: #333333; } table.header td { padding: 0; font-size: 10pt; } table.footer td { padding: 0; font-size: 8pt; } table.itemtable th { padding-bottom: 10px; padding-top: 10px; } table.body td { padding-top: 2px; } td.addressheader { font-weight: bold; font-size: 8pt; padding-top: 6px; padding-bottom: 2px; } td.address { padding-top: 0; } span.title { font-size: 28pt; } span.number { font-size: 16pt; } div.remittanceSlip { width: 100%; height: 200pt; page-break-inside: avoid; page-break-after: avoid; } hr { border-top: 1px dashed #d3d3d3; width: 100%; color: #ffffff; background-color: #ffffff; height: 1px; } </style> </head>'+
     '<body header=\"nlheader\" header-height=\"14%\" footer=\"nlfooter\" footer-height=\"20pt\" padding=\"0.5in 0.5in 0.5in 0.5in\" size=\"Letter-landscape\">'+
     '<table style=\"width: 100%; margin-top: 20px;\"><tr><td class=\"addressheader\" colspan=\"3\">Vendor Name :'+vendorFullName+'</td>'+
     ' </tr><tr>';
       if(address) 
         {
      xml +='<td class=\"address\" colspan=\"3\"><b>Addess:'+address+'</b></td>';
         }
           xml +='</tr>   <tr><td colspan=\"3\"><b>Statement From :'+startDate+' To : '+endDate+'</b></td></tr></table>'+
'<table style=\"width: 100%; margin-top: 10px;\" border="1px">'+
 '<tr><td colspan="38" border-bottom="1px"><b>Bill&Payments</b></td></tr>'+
' <tr> <th colspan=\"6\" border-bottom="1px" border-right="1px">Date</th> <th colspan=\"4\" border-bottom="1px" border-right="1px">Type</th> <th colspan=\"5\" border-bottom="1px" border-right="1px">Doc No</th> <th colspan=\"3\" border-bottom="1px" border-right="1px">Status</th> <th colspan=\"8\" border-bottom="1px" border-right="1px">Memo</th> <th align=\"right\" colspan=\"4\" border-bottom="1px" border-right="1px">DR</th> <th align=\"right\" colspan=\"4\" border-bottom="1px" border-right="1px">CR</th> <th align=\"right\" colspan=\"4\" border-bottom="1px">Ending Balance</th> </tr> ';
                    var xmlStr = '<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>';
                    xmlStr += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" ';
                    xmlStr += 'xmlns:o="urn:schemas-microsoft-com:office:office" ';
                    xmlStr += 'xmlns:x="urn:schemas-microsoft-com:office:excel" ';
                    xmlStr += 'xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" ';
                    xmlStr += 'xmlns:html="http://www.w3.org/TR/REC-html40">';
                    xmlStr += '<Styles>' +
                        '<Style ss:ID="s63">' +
                        '<Font x:CharSet="204" ss:Size="12" ss:Color="#B3C235" ss:Bold="1" ss:Underline="Single"/>' +
                        '</Style><Style ss:ID="s64">' +
                        '<Font x:CharSet="204" ss:Size="12" ss:Color="#EC1848" ss:Bold="1" />' +
                        '</Style>' +
                        '</Styles>';
                    xmlStr += '<Worksheet ss:Name="Sheet1">';
                    xmlStr += '<Table>';
                    xmlStr += '<Row>' +
                        '<Cell ss:StyleID="s63"><Data ss:Type="String"><b>Start Date</b> </Data></Cell>' +
                        '<Cell ss:StyleID="s63"><Data ss:Type="String"><b>End Date</b></Data></Cell>' +
                        '<Cell ss:StyleID="s63"><Data ss:Type="String"><b>Vendor </b></Data></Cell>' +
                        '</Row>';
                    xmlStr += '<Row>' +
                        '<Cell ss:StyleID="s63"><Data ss:Type="String"> ' + startDate + ' </Data></Cell>' +
                        '<Cell ss:StyleID="s63"><Data ss:Type="String">' + endDate + '</Data></Cell>' +
                        '<Cell ss:StyleID="s63"><Data ss:Type="String">' + vendor + '</Data></Cell>' +
                        '</Row>';
                    xmlStr += '<Row>' +
                        '</Row>';
                    xmlStr += '<Row>' +'<Cell ss:StyleID="s64"><Data ss:Type="String"><b>Bills & Payments</b> </Data></Cell>' +
                        '</Row>';                   
                    xmlStr += '<Row>' +
                        '<Cell ss:StyleID="s64"><Data ss:Type="String"><b>Date</b> </Data></Cell>' +
                        '<Cell ss:StyleID="s64"><Data ss:Type="String"><b>Type </b></Data></Cell>' +
                        '<Cell ss:StyleID="s64"><Data ss:Type="String"><b>Document No</b></Data></Cell>' +
                        '<Cell ss:StyleID="s64"><Data ss:Type="String"><b>Memo</b></Data></Cell>' +
                        '<Cell ss:StyleID="s64"><Data ss:Type="String"><b>Status </b></Data></Cell>' +
                        '<Cell ss:StyleID="s64"><Data ss:Type="String"><b>DR </b></Data></Cell>' +
                        '<Cell ss:StyleID="s64"><Data ss:Type="String"><b>CR </b></Data></Cell>' +
                        '<Cell ss:StyleID="s64"><Data ss:Type="String"><b>Balanace</b></Data></Cell>' +
                        '</Row>';
                    xmlStr += '<Row>' +
                        '<Cell><Data ss:Type="String"></Data></Cell>' +
                        '<Cell><Data ss:Type="String"></Data></Cell>' +
                        '<Cell><Data ss:Type="String"> </Data></Cell>' +
                        '<Cell><Data ss:Type="String"> </Data></Cell>' +
                        '<Cell><Data ss:Type="String"></Data></Cell>' +
                        '<Cell><Data ss:Type="String"></Data></Cell>' +
                        '<Cell><Data ss:Type="String"></Data></Cell>' +
                        '<Cell><Data ss:Type="String"> </Data></Cell>' +
                        '<Cell><Data ss:Type="String"></Data></Cell>' +
                        '</Row>';
                    for (var i = 0; i < numLines; i++) {
                        var date = request.getSublistValue({
                            group: 'custpage_report_sublist',
                            name: 'custpage_tran_date_text',
                            line: i
                        });
                        var account = request.getSublistValue({
                            group: 'custpage_report_sublist',
                            name: 'custpage_account',
                            line: i
                        });
                        var type = request.getSublistValue({
                            group: 'custpage_report_sublist',
                            name: 'custpage_type',
                            line: i
                        });
                        var docNo = request.getSublistValue({
                            group: 'custpage_report_sublist',
                            name: 'custpage_doc_no',
                            line: i
                        });
                        var status = request.getSublistValue({
                            group: 'custpage_report_sublist',
                            name: 'custpage_tran_status',
                            line: i
                        });
                        var dueDate = request.getSublistValue({
                            group: 'custpage_report_sublist',
                            name: 'custpage_due_date',
                            line: i
                        });
                        var amount = request.getSublistValue({
                            group: 'custpage_report_sublist',
                            name: 'custpage_amount',
                            line: i
                        });
                        var vpAmount = request.getSublistValue({
                            group: 'custpage_report_sublist',
                            name: 'custpage_vendor_prepayment_amount',
                            line: i
                        });
                        var billedAmount = request.getSublistValue({
                            group: 'custpage_report_sublist',
                            name: 'custpage_billed',
                            line: i
                        });
                       if(billedAmount){
                             billedAmount = addZeroes(billedAmount.toString());
                             billedAmount = numberWithCommas(billedAmount.toString());
                             
                        }
                        var paidAmount = request.getSublistValue({
                            group: 'custpage_report_sublist',
                            name: 'custpage_paid',
                            line: i
                        });
                      if(paidAmount){
                            paidAmount = addZeroes(paidAmount.toString());
                             paidAmount = numberWithCommas(paidAmount.toString());
                        }
                        var balanceAmount = request.getSublistValue({
                            group: 'custpage_report_sublist',
                            name: 'custpage_balance',
                            line: i
                        });
                      if(balanceAmount){
                            balanceAmount = addZeroes(balanceAmount.toString());
                             balanceAmount = numberWithCommas(balanceAmount.toString());
                        }
                        var cfVendorPrepaymentAmount = request.getSublistValue({
                            group: 'custpage_report_sublist',
                            name: 'custpage_cf_unapplied_vendor_pp_amount',
                            line: i
                        });
                        var memo = request.getSublistValue({
                            group: 'custpage_report_sublist',
                            name: 'custpage_memo',
                            line: i
                        });
                        log.debug('date', date);
                     /* if(i==0)
                        {
                          xml += '<tr> <td colspan=\"7\"><b>Opening Balance</b></td>  <td colspan=\"5\"></td> <td colspan=\"3\"></td> <td colspan=\"8\"></td> <td align=\"right\" colspan=\"4\"></td> <td align=\"right\" colspan=\"4\"></td> <td align=\"right\" colspan=\"4\">'+balanceAmount+'</td> </tr> '; 
                        }*/
                      if(i!=numLines-1)
                        {
                          xml +=' <tr>';
                            if(date)
                          {
                            xml +='<td colspan="6" border-bottom="1px" border-right="1px">' + (date ? (date) : '') + '</td>';
                          }
                          else{
                            xml +='<td colspan="6" border-bottom="1px" border-right="1px"><b>Opening Balance</b></td>';
                          }
                                xml +='<td colspan="4" border-bottom="1px" border-right="1px">' + (type ? type : '') + '</td>'+
                                '<td colspan="5" border-bottom="1px" border-right="1px">' + (docNo ? docNo : '') + '</td>'+
                                '<td colspan="3" border-bottom="1px" border-right="1px">' + (status ? status : '') + '</td>'+
                                '<td colspan="8" border-bottom="1px" border-right="1px">' + (memo ? memo : '') + '</td>'+
                                '<td align="right" colspan="4" border-bottom="1px" border-right="1px">' + (paidAmount ? paidAmount : '') + '</td>'+
                                '<td align="right" colspan="4" border-bottom="1px" border-right="1px">' + (billedAmount ? billedAmount : '') + '</td>'+
                                '<td align="right" colspan="4" border-bottom="1px" border-right="1px">' + (balanceAmount ? balanceAmount : '') + '</td>'+
                                '</tr>';
                        }
                      else 
                        {
                           xml += '<tr> <td colspan=\"10\" border-bottom="1px" border-right="1px"><b>Ending Balance</b></td>  <td colspan=\"5\" border-bottom="1px" border-right="1px"></td> <td colspan=\"3\" border-bottom="1px" border-right="1px"></td> <td colspan=\"8\" border-bottom="1px" border-right="1px"></td> <td align=\"right\" colspan=\"4\" border-bottom="1px" border-right="1px"></td> <td  align=\"right\" colspan=\"4\" border-bottom="1px" border-right="1px"></td> <td align=\"right\" colspan=\"4\" border-bottom="1px" border-right="1px">'+balanceAmount+'</td> </tr></table>';
                        }
                      
                        xmlStr += '<Row>' +
                            '<Cell><Data ss:Type="String">' + (date ? (date) : '') + '</Data></Cell>' +
                            '<Cell><Data ss:Type="String">' + (type ? type : '') + '</Data></Cell>' +
                            '<Cell><Data ss:Type="String">' + (docNo ? docNo : '') + '</Data></Cell>' +
                            '<Cell><Data ss:Type="String">' + (memo ? memo : '') + '</Data></Cell>' +
                            '<Cell><Data ss:Type="String">' + (status ? status : '') + '</Data></Cell>' +
                            '<Cell><Data ss:Type="Number">' + (paidAmount ? paidAmount : '') + '</Data></Cell>' +
                            '<Cell><Data ss:Type="Number">' + (billedAmount ? billedAmount : '') + '</Data></Cell>' +
                            '<Cell><Data ss:Type="Number">' + (balanceAmount ? balanceAmount : '') + '</Data></Cell>' +
                            '</Row>';
                    }
                  

                    //prepayments
                    var numLines = request.getLineCount({
                        group: 'custpage_prepayment_sublist'
                    });
                  xml+='<table  style=\"width: 100%; margin-top: 40px;\" border="1px">'+
 '<tr><td colspan="38" border-bottom="1px"><b>Vendor Prepayments</b></td></tr>'+
' <tr> <th colspan=\"6\" border-bottom="1px" border-right="1px">Date</th> <th colspan=\"4\" border-bottom="1px" border-right="1px">Type</th> <th colspan=\"5\" border-bottom="1px" border-right="1px">Doc No</th> <th colspan=\"3\" border-bottom="1px" border-right="1px">Status</th> <th colspan=\"8\" border-bottom="1px" border-right="1px">Memo</th> <th align=\"right\" colspan=\"4\" border-bottom="1px" border-right="1px">Amount</th> <th align=\"right\" colspan=\"4\" border-bottom="1px" border-right="1px">Applied Amount</th> <th  colspan=\"4\" border-bottom="1px" border-right="1px"><p align="center">Remaining Balance</p></th> </tr> ';
                    xmlStr += '<Row>' +
                        '</Row>';
                    xmlStr += '<Row>' +'<Cell ss:StyleID="s64"><Data ss:Type="String"><b>Prepayments</b> </Data></Cell>' +
                        '</Row>';
                    xmlStr += '<Row>' +
                        '<Cell ss:StyleID="s64"><Data ss:Type="String"><b>Date</b> </Data></Cell>' +
                        '<Cell ss:StyleID="s64"><Data ss:Type="String"><b>Type </b></Data></Cell>' +
                        '<Cell ss:StyleID="s64"><Data ss:Type="String"><b>Document No</b></Data></Cell>' +
                        '<Cell ss:StyleID="s64"><Data ss:Type="String"><b>Memo</b></Data></Cell>' +
                        '<Cell ss:StyleID="s64"><Data ss:Type="String"><b>Status </b></Data></Cell>' +
                        '<Cell ss:StyleID="s64"><Data ss:Type="String"><b>Amount </b></Data></Cell>' +
                        '<Cell ss:StyleID="s64"><Data ss:Type="String"><b>Applied Amount </b></Data></Cell>' +
                        '<Cell ss:StyleID="s64"><Data ss:Type="String"><b>Remaining Amount</b></Data></Cell>' +
                        '</Row>';
                    xmlStr += '<Row>' +
                        '<Cell><Data ss:Type="String"></Data></Cell>' +
                        '<Cell><Data ss:Type="String"> </Data></Cell>' +
                        '<Cell><Data ss:Type="String"></Data></Cell>' +
                        '<Cell><Data ss:Type="String"></Data></Cell>' +
                        '<Cell><Data ss:Type="String"></Data></Cell>' +
                        '<Cell><Data ss:Type="String"> </Data></Cell>' +
                        '<Cell><Data ss:Type="String"></Data></Cell>' +
                        '</Row>';
                    for (var i = 0; i < numLines; i++) {
                        var date = request.getSublistValue({
                            group: 'custpage_prepayment_sublist',
                            name: 'custpage_vpp_tran_date_text',
                            line: i
                        });
                        var account = request.getSublistValue({
                            group: 'custpage_prepayment_sublist',
                            name: 'custpage_vpp_account',
                            line: i
                        });
                        var type = request.getSublistValue({
                            group: 'custpage_prepayment_sublist',
                            name: 'custpage_vpp_type',
                            line: i
                        });
                        var docNo = request.getSublistValue({
                            group: 'custpage_prepayment_sublist',
                            name: 'custpage_vpp_doc_no',
                            line: i
                        });
                        var status = request.getSublistValue({
                            group: 'custpage_prepayment_sublist',
                            name: 'custpage_vpp_tran_status',
                            line: i
                        });
                        var dueDate = request.getSublistValue({
                            group: 'custpage_prepayment_sublist',
                            name: 'custpage_vpp_due_date',
                            line: i
                        });
                        var appliedAmount = request.getSublistValue({
                            group: 'custpage_prepayment_sublist',
                            name: 'custpage_applied_amount',
                            line: i
                        });
                      if(appliedAmount){
                             appliedAmount = addZeroes(appliedAmount.toString());
                             appliedAmount = numberWithCommas(appliedAmount.toString());
                        }
                        var prepaymentAmount = request.getSublistValue({
                            group: 'custpage_prepayment_sublist',
                            name: 'custpage_vpp_vendor_prepayment_amount',
                            line: i
                        });
                       if(prepaymentAmount){
                             prepaymentAmount = addZeroes(prepaymentAmount.toString());
                             prepaymentAmount = numberWithCommas(prepaymentAmount.toString());
                        }
                         var remainingAmount = request.getSublistValue({
                            group: 'custpage_prepayment_sublist',
                            name: 'custpage_remaining_amount',
                            line: i
                        });
                      if(remainingAmount){
                         totalAmount=remainingAmount;
                             remainingAmount = addZeroes(remainingAmount.toString());
                             remainingAmount = numberWithCommas(remainingAmount.toString());
                        }
                        var memo = request.getSublistValue({
                            group: 'custpage_prepayment_sublist',
                            name: 'custpage_vpp_memo',
                            line: i
                        });
                       // log.debug('date', date);
                      if(i != numLines-1 )
                        {
                          
                       xml +=' <tr>';
                         if(date)
                           {
                               xml += '<td colspan="6" border-bottom="1px" border-right="1px">' + (date ? (date) : '') + '</td>';
                           }
                          else{
                            xml +='<td colspan="6" border-bottom="1px" border-right="1px"><b>Ending Balance</b></td>';
                          }
                               xml += '<td colspan="4" border-bottom="1px" border-right="1px">' + (type ? type : '') + '</td>'+
                                '<td colspan="5" border-bottom="1px" border-right="1px">' + (docNo ? docNo : '') + '</td>'+
                                '<td colspan="3" border-bottom="1px" border-right="1px">' + (status ? status : '') + '</td>'+
                                '<td colspan="8" border-bottom="1px" border-right="1px">' + (memo ? memo : '') + '</td>'+
                                '<td align="right" colspan="4" border-bottom="1px" border-right="1px">' + (prepaymentAmount ? prepaymentAmount : '') + '</td>'+
                                '<td align="right" colspan="4" border-bottom="1px" border-right="1px">' + (appliedAmount ? appliedAmount : '') + '</td>'+
                                '<td align="right" colspan="4" border-bottom="1px" border-right="1px">' + (remainingAmount ? remainingAmount : '') + '</td>'+
                                '</tr>';
                        }
                      else
                        {
                          xml +=' <tr>'+
                                '<th colspan="10" border-bottom="1px" border-right="1px"><b>Net Balance</b></th>'+
                                '<th colspan="5" border-bottom="1px" border-right="1px"></th>'+
                                '<th colspan="3" border-bottom="1px" border-right="1px"></th>'+
                                '<th colspan="8" border-bottom="1px" border-right="1px"></th>'+
                                '<th align="right" colspan="4" border-bottom="1px" border-right="1px"></th>'+
                                '<th align="right" colspan="4" border-bottom="1px" border-right="1px"></th>'+
                                '<th align="right" colspan="4" border-bottom="1px" border-right="1px">' + (remainingAmount ? remainingAmount : '') + '</th>'+
                                '</tr>';
                        }
                      
                        if(i == (numLines -1)){
                            xmlStr += '<Row>' +
                            '<Cell><Data ss:Type="String"></Data></Cell>' +
                            '<Cell><Data ss:Type="String"></Data></Cell>' +
                            '<Cell><Data ss:Type="String"></Data></Cell>' +
                            '<Cell><Data ss:Type="String"> </Data></Cell>' +
                            '<Cell><Data ss:Type="String"> </Data></Cell>' +
                            '<Cell><Data ss:Type="String"></Data></Cell>' +
                            '<Cell><Data ss:Type="String"></Data></Cell>' +
                            '<Cell><Data ss:Type="String"></Data></Cell>' +
                            '<Cell><Data ss:Type="String"> </Data></Cell>' +
                            '<Cell><Data ss:Type="String"></Data></Cell>' +
                            '</Row>';

                             xmlStr += '<Row>' +
                            '<Cell><Data ss:Type="String">Final Balance</Data></Cell>' +
                            '<Cell><Data ss:Type="String">' + (type ? type : '') + '</Data></Cell>' +
                            '<Cell><Data ss:Type="String">' + (docNo ? docNo : '') + '</Data></Cell>' +
                            '<Cell><Data ss:Type="String">' + (memo ? memo : '') + '</Data></Cell>' +
                            '<Cell><Data ss:Type="String">' + (status ? status : '') + '</Data></Cell>' +
                            '<Cell><Data ss:Type="Number">' + (prepaymentAmount ? prepaymentAmount : '') + '</Data></Cell>' +
                            '<Cell><Data ss:Type="Number">' + (appliedAmount ? appliedAmount : '') + '</Data></Cell>' +
                            '<Cell><Data ss:Type="Number">' + (remainingAmount ? remainingAmount : '') + '</Data></Cell>' +
                            '</Row>';
                        }else{
                            xmlStr += '<Row>' +
                            '<Cell><Data ss:Type="String">' + (date ? (date) : '') + '</Data></Cell>' +
                            '<Cell><Data ss:Type="String">' + (type ? type : '') + '</Data></Cell>' +
                            '<Cell><Data ss:Type="String">' + (docNo ? docNo : '') + '</Data></Cell>' +
                            '<Cell><Data ss:Type="String">' + (memo ? memo : '') + '</Data></Cell>' +
                            '<Cell><Data ss:Type="String">' + (status ? status : '') + '</Data></Cell>' +
                            '<Cell><Data ss:Type="Number">' + (prepaymentAmount ? prepaymentAmount : '') + '</Data></Cell>' +
                            '<Cell><Data ss:Type="Number">' + (appliedAmount ? appliedAmount : '') + '</Data></Cell>' +
                            '<Cell><Data ss:Type="Number">' + (remainingAmount ? remainingAmount : '') + '</Data></Cell>' +
                            '</Row>';
                        }
                        
                    }
                   xml +='</table>';
                   
                    xmlStr += '</Table></Worksheet></Workbook>';
                  var reencoded = encode.convert({
                        string: xmlStr,
                        inputEncoding: encode.Encoding.UTF_8,
                       outputEncoding: encode.Encoding.BASE_64
                    });
            var fileObj1 = file.create({
                        name: 'CustomerStatement.xls',
                        fileType: 'EXCEL',
                        contents: reencoded,
                        //                  encoding: file.Encoding.BASE_64,
                        folder: -10,
                        isOnline: true
                      
                    });
                  
                  var fileId = fileObj1.save();
                  var fileObj = file.load({
                    id : fileId
                  });
                  var fileUrl = fileObj.url;
                  log.debug('fileUrl', fileUrl);
                        
                    xml +='<a href="'+fileUrl+'">Print Excel</a>';

                   xml += '</body></pdf>';
                   log.debug('xml',xml);
                 
                    xml = xml.replace(/\&/g, "&amp;");
                    var pdfFile = render.xmlToPdf({
                        xmlString: xml
                    });
                    log.debug('xmlStr', xmlStr);
                   var renderer = render.create();
                     renderer.templateContent = xml;
                     var statementPdf = renderer.renderAsPdf();
                     response.writeFile(statementPdf);
                    //var fileId = fileObj.save();
                    log.debug('fileobj',fileObj1);
                    context.response.writeFile(fileObj1);
                  
                }
              context.response.writePage(form);
                form.clientScriptModulePath = './DA_CS_Currency_Report.js';
            } catch (ex) {
                log.error(ex.name, ex.message);
            }
        }

        function contains(arr, element) {
            for (var i = 0; i < arr.length; i++) {
                if (arr[i] === element) {
                    return true;
                }
            }
            return false;
        }
   function addZeroes(num) {
            // Convert input string to a number and store as a variable.
                var value = Number(num);      
            // Split the input string into two arrays containing integers/decimals
                var res = num.split(".");     
            // If there is no decimal point or only one decimal place found.
                if(res.length == 1 || res[1].length < 3) { 
            // Set the number to two decimal places
                    value = value.toFixed(2);
                }
            // Return updated or original number.
            return value;
            }

        function functioncallingwithoutparams() {
            var transactionSearchObj = search.create({
                type: "transaction",
                filters: [
                    ["name", "anyof", "734"],
                    "AND",
                    ["mainline", "is", "T"],
                    "AND",
                    ["type", "anyof", "VendBill", "VendCred", "VendPymt", "Journal", "VPrepApp", "VPrep", "FxReval"]
                ],
                columns: [
                    search.createColumn({
                        name: "internalid",
                        label: "Internal ID"
                    }),
                    search.createColumn({
                        name: "account",
                        label: "Account"
                    }),
                    search.createColumn({
                        name: "type",
                        label: "Type"
                    }),
                    search.createColumn({
                        name: "trandate",
                        sort: search.Sort.ASC,
                        label: "Date"
                    }),
                    search.createColumn({
                        name: "tranid",
                        label: "Document Number"
                    }),
                    search.createColumn({
                        name: "statusref",
                        label: "Status"
                    }),
                    search.createColumn({
                        name: "duedate",
                        label: "Due Date/Receive By"
                    }),
                    search.createColumn({
                        name: "entity",
                        label: "Name"
                    }),
                    search.createColumn({
                        name: "postingperiod",
                        label: "Period"
                    }),
                    search.createColumn({
                        name: "amount",
                        label: "Amount"
                    })
                ]
            });
            var searchResultCount = transactionSearchObj.runPaged().count;
            log.debug("transactionSearchObj result count", searchResultCount);
            var myPagedData = transactionSearchObj.runPaged({
                pageSize: 4000
            });
            return myPagedData;
        }
        function numberWithCommas(x) {
         x = x.toString();
       var pattern = /(-?\d+)(\d{3})/;
          while (pattern.test(x))
        x = x.replace(pattern, "$1,$2");
         return x;
          }
 function convertNumberToWords(s) {
         var th = ['', 'Thousand', 'Million', 'Billion', 'Trillion'];
            var dg = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
            var tn = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
            var tw = ['Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
            s = s.toString();
            s = s.replace(/[\, ]/g, '');
            if (s != parseFloat(s)) return 'not a number';
            var x = s.indexOf('.');
            if (x == -1)
                x = s.length;
            if (x > 15)
                return 'too big';
            var n = s.split('');
            var str = '';
            var sk = 0;
            for (var i = 0; i < x; i++) {
                if ((x - i) % 3 == 2) {
                    if (n[i] == '1') {
                        str += tn[Number(n[i + 1])] + ' ';
                        i++;
                        sk = 1;
                    } else if (n[i] != 0) {
                        str += tw[n[i] - 2] + ' ';
                        sk = 1;
                    }
                } else if (n[i] != 0) { // 0235
                    str += dg[n[i]] + ' ';
                    if ((x - i) % 3 == 0) str += 'hundred ';
                    sk = 1;
                }
                if ((x - i) % 3 == 1) {
                    if (sk)
                        str += th[(x - i - 1) / 3] + ' ';
                    sk = 0;
                }
            }
            if (x != s.length) {
                var y = s.length;
                str += 'point ';
                for (var i = x + 1; i < y; i++)
                    str += dg[n[i]] + ' ';
            }
            return str.replace(/\s+/g, ' ');
    }


        return {
            onRequest: onRequest
        };
    });
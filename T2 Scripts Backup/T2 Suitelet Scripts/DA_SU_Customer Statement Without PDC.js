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
                        title: 'Customer Statement'
                    });
                    form.addSubmitButton({
                        label: 'Print'
                    });
                    var tab = form.addSubtab({
                        id: 'custpage_tab',
                        label: 'Report'
                    });
                    //Report Sublist            
                    var reportList = form.addSublist({
                        id: 'custpage_report_sublist',
                        type: ui.SublistType.LIST,
                        label: 'Statement',
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
                   var subsidiaryField = form.addField({
                        id: 'custpage_ss_subsidiary',
                        type: ui.FieldType.SELECT,
                        label: 'Select Subsidiary',
                        source: 'subsidiary',
                        container: 'custpage_tab'
                    }).updateBreakType({
                        breakType: ui.FieldBreakType.STARTCOL
                    });
                    var customerField = form.addField({
                        id: 'custpage_ss_customer',
                        type: ui.FieldType.SELECT,
                        label: 'Select Customer',
                        source: 'customer',
                        container: 'custpage_tab'
                    }).updateBreakType({
                        breakType: ui.FieldBreakType.STARTCOL
                    });
                    customerField.updateDisplaySize({
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
                    var dateRefField = reportList.addField({
                        id: 'custpage_tran_date',
                        type: ui.FieldType.TEXT,
                        label: 'Date'
                    });
                    var dateField = reportList.addField({
                        id: 'custpage_tran_date_text',
                        type: ui.FieldType.TEXT,
                        label: 'Date'
                    }).updateDisplayType({
                        displayType: ui.FieldDisplayType.HIDDEN
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
                    reportList.addField({
                        id: 'custpage_memo',
                        type: ui.FieldType.TEXT,
                        label: 'Memo'
                    });
                    reportList.addField({
                        id: 'custpage_tran_status',
                        type: ui.FieldType.TEXT,
                        label: 'Status'
                    });
                    reportList.addField({
                        id: 'custpage_amount',
                        type: ui.FieldType.CURRENCY,
                        label: 'Amount'
                    });
                    reportList.addField({
                        id: 'custpage_debit_charge',
                        type: ui.FieldType.CURRENCY,
                        label: 'Debit'
                    });
                    reportList.addField({
                        id: 'custpage_credit_payment',
                        type: ui.FieldType.CURRENCY,
                        label: 'Credit'
                    });
                    reportList.addField({
                        id: 'custpage_balance',
                        type: ui.FieldType.CURRENCY,
                        label: 'Balance'
                    });
                    var balance = 0;
                    var cfVendorPrepaymentAmount = 0;
                    if (request.parameters.customerId) {
                        if (request.parameters.startDate || request.parameters.customerId || request.parameters.endDate) {
                            // log.debug('params');
                            var firstDateString;
                            var formattedDateString;
                            customerField.defaultValue = request.parameters.customerId;
                            if (request.parameters.endDate != "") {
                                var startTomorrow = new Date(request.parameters.startDate);
                                startTomorrow.setDate(startTomorrow.getDate() + 1);
                                startDateField.defaultValue = startTomorrow;
                                var endTomorrow = new Date(request.parameters.endDate);
                                endTomorrow.setDate(endTomorrow.getDate() + 1);
                                endDateField.defaultValue = endTomorrow;
                                var startDate = (request.parameters.startDateText);
                                var endDate = (request.parameters.endDateText);
                                var startDateFormat = request.parameters.startDate;
                                var dateObj = new Date(request.parameters.startDate);
                                log.debug('dateObj', dateObj);
                               // dateObj.setDate(dateObj.getDate() + 1);
                                formattedDateString = format.format({
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
                            var customerId = request.parameters.customerId;
                          var subsidiaryId = request.parameters.subsidiaryId;
                          if(!subsidiaryId){
                            subsidiaryId = 1;
                          }
                          subsidiaryField.defaultValue = subsidiaryId;
                            var openingBalance = 0;
                            var transactionSearchObj;
                            if (request.parameters.customerId && request.parameters.endDate == "") {
                                transactionSearchObj = search.create({
                                    type: "transaction",
                                    filters: [
                                        [
                                            ["name", "anyof", customerId], "AND", ["mainline", "is", "T"], "AND", ["type", "noneof", "SalesOrd", "Journal", "Estimate","RtnAuth","ItemShip","DepAppl"],"AND",['subsidiary', 'anyof', subsidiaryId]
                                        ],
                                        "OR",
                                        [
                                            ["type", "anyof", "Journal"], "AND", ["accounttype", "anyof", "AcctRec"], "AND", ["name", "anyof", customerId],"AND",['subsidiary', 'anyof', subsidiaryId]
                                        ]
                                    ],
                                    columns: [
                                        search.createColumn({
                                            name: "internalid",
                                            label: "Id"
                                        }),
                                        search.createColumn({
                                            name: "trandate",
                                            sort: search.Sort.ASC,
                                            label: "Date"
                                        }),
                                        search.createColumn({
                                            name: "type",
                                            label: "Type"
                                        }),
                                        search.createColumn({
                                            name: "tranid",
                                            label: "Document Number"
                                        }),
                                        search.createColumn({
                                            name: "memo",
                                            label: "Memo"
                                        }),
                                        search.createColumn({
                                            name: "amount",
                                            label: "Amount"
                                        }),
                                        search.createColumn({
                                            name: "statusref",
                                            label: "Status"
                                        })
                                    ]
                                });
                                var searchResultCount = transactionSearchObj.runPaged().count;
                                log.debug("transactionSearchObj result count", searchResultCount);
                            } else {
                                log.debug('firstDateString', firstDateString);
                                log.debug('formattedDateString', formattedDateString);
                                var opTransactionSearchObj = search.create({
                                    type: "transaction",
                                    filters: [
                                        [
                                            ["name", "anyof", customerId], "AND", ["trandate", "within", firstDateString, formattedDateString], "AND", ["mainline", "is", "T"], "AND", ["type", "noneof", "SalesOrd", "Journal", "Estimate", "CustDep","RtnAuth","ItemShip"],"AND",['subsidiary', 'anyof', subsidiaryId]
                                        ],
                                        "OR",
                                        [
                                            ["type", "anyof", "Journal"], "AND", ["accounttype", "anyof", "AcctRec"], "AND", ["name", "anyof", customerId], "AND", ["trandate", "within", firstDateString, formattedDateString],"AND",['subsidiary', 'anyof', subsidiaryId]
                                        ]
                                    ],
                                    columns: [
                                        search.createColumn({
                                            name: "formulanumeric",
                                            summary: "SUM",
                                            formula: "CASE WHEN {type} LIKE '%Payment%' THEN - {amount}ELSE {amount} END",
                                            label: "Formula (Numeric)"
                                        })
                                    ]
                                });
                                var searchResultCount = opTransactionSearchObj.runPaged().count;
                                log.debug("transactionSearchObj result count", searchResultCount);
                                opTransactionSearchObj.run().each(function(result) {
                                    openingBalance = result.getValue({
                                        name: 'formulanumeric',
                                        summary: search.Summary.SUM
                                    });
                                    if (openingBalance == undefined || openingBalance == '' || openingBalance == null) {
                                        openingBalance = 0;
                                    }
                                    return true;
                                });
                              
                              var dateObj = new Date(request.parameters.startDate);
                                log.debug('dateObj', dateObj);
                               dateObj.setDate(dateObj.getDate() + 1);
                                formattedDateString = format.format({
                                    value: dateObj,
                                    type: format.Type.DATE
                                });
                                var endDateFormat = new Date(request.parameters.endDate);

                                endDateFormat.setDate(endDateFormat.getDate() + 1);
                                var dateObj = new Date(endDateFormat);
                                var endDateString = format.format({
                                    value: dateObj,
                                    type: format.Type.DATE
                                });
                                transactionSearchObj = search.create({
                                    type: "transaction",
                                    filters: [
                                        [
                                            ["trandate", "within", formattedDateString, endDateString],
                                            "AND",
                                            ["name", "anyof", customerId], "AND", ["mainline", "is", "T"], "AND", ["type", "noneof", "SalesOrd", "Journal", "Estimate","RtnAuth","ItemShip","DepAppl"],
                                           "AND",['subsidiary', 'anyof', subsidiaryId]
                                        ],
                                        "OR",
                                        [
                                            ["type", "anyof", "Journal"], "AND", ["accounttype", "anyof", "AcctRec"], "AND", ["name", "anyof", customerId],"AND",['subsidiary', 'anyof', subsidiaryId]
                                        ]
                                    ],
                                    columns: [
                                        search.createColumn({
                                            name: "internalid",
                                            label: "Id"
                                        }),
                                        search.createColumn({
                                            name: "trandate",
                                            sort: search.Sort.ASC,
                                            label: "Date"
                                        }),
                                        search.createColumn({
                                            name: "type",
                                            label: "Type"
                                        }),
                                        search.createColumn({
                                            name: "tranid",
                                            label: "Document Number"
                                        }),
                                        search.createColumn({
                                            name: "memo",
                                            label: "Memo"
                                        }),
                                        search.createColumn({
                                            name: "amount",
                                            label: "Amount"
                                        }),
                                        search.createColumn({
                                            name: "statusref",
                                            label: "Status"
                                        })
                                    ]
                                });
                            }
                            if (request.parameters.startDate && request.parameters.customerId && request.parameters.endDate) {
                                log.debug('formattedDateString', formattedDateString);
                                log.debug('endDateString', endDateString);
                                //transactionSearchObj.filters.push("AND");
                                transactionSearchObj.filters.push(search.createFilter({
                                    name: 'trandate',
                                    operator: 'within',
                                    values: [formattedDateString, endDateString]
                                }));
                            }
                            var finalBalance = 0;
                            reportList.setSublistValue({
                                id: 'custpage_tran_date',
                                line: 0,
                                value: "<b>Balance Forward</b>"
                            });
                            reportList.setSublistValue({
                                id: 'custpage_balance',
                                line: 0,
                                value: openingBalance
                            });
                            var i = 1;
                            transactionSearchObj.run().each(function(result) {
                                var type = result.getText({
                                    name: 'type'
                                });
                                var typeText;
                                if (type == "Invoice") {
                                    typeText = "custinvc"
                                }
                                if (type == "Payment") {
                                    typeText = "custpymt"
                                }
                                if (type == "Customer Deposit") {
                                    typeText = "custdep"
                                }
                                if (type == "Deposit Application") {
                                    typeText = "depappl"
                                }
                                if (type == "Journal") {
                                    typeText = "journal"
                                }
                                var date = result.getValue({
                                    name: 'trandate'
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
                                if (true) {
                                    reportList.setSublistValue({
                                        id: 'custpage_tran_date',
                                        line: i,
                                        value: "<html><style type='text/css'>a { text-decoration:none; }</style><a href=/app/accounting/transactions/" + typeText + ".nl?id=" + result.id + "&whence=><font color='#255599'>" + date + "</font></a></html>"
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
                                    var amount = result.getValue('amount');
                                    if (amount < 0) {
                                        reportList.setSublistValue({
                                            id: 'custpage_amount',
                                            line: i,
                                            value: -(result.getValue('amount'))
                                        });
                                    } else {
                                        reportList.setSublistValue({
                                            id: 'custpage_amount',
                                            line: i,
                                            value: (result.getValue('amount'))
                                        });
                                    }
                                    if (type == 'Payment' || type == 'Customer Deposit' || type == "Deposit Application" || type == "Customer Refund") {
                                        amount = -(amount);
                                    }
                                    if (amount < 0) {
                                        reportList.setSublistValue({
                                            id: 'custpage_credit_payment',
                                            line: i,
                                            value: -(amount)
                                        });
                                    } else {
                                        reportList.setSublistValue({
                                            id: 'custpage_debit_charge',
                                            line: i,
                                            value: amount
                                        });
                                    }
                                    if (type != 'Deposit Application') {
                                        openingBalance = parseFloat(openingBalance) + parseFloat(amount);
                                    }
                                    reportList.setSublistValue({
                                        id: 'custpage_balance',
                                        line: i,
                                        value: Number(openingBalance).toFixed(2)
                                    });
                                }
                                i++;
                                return true;
                            });
                            reportList.setSublistValue({
                                id: 'custpage_balance',
                                line: i,
                                value: Number(openingBalance).toFixed(2)
                            });
                        }
                    }
                  
                } else {
                    log.debug('params', request.parameters);
                    var startDate = request.parameters.custpage_ss_start_date;
                    var endDate = request.parameters.custpage_ss_end_date;
                    var customerId = request.parameters.custpage_ss_customer;
                    customerRec = record.load({
                        type: 'customer',
                        id: customerId
                    });
                    customerId = customerRec.getValue('entityid');
                    var customerAddress = customerRec.getValue('defaultaddress');
                    log.debug('startDate', startDate);
                    log.debug('endDate', endDate);
                    //log.debug('vendor', vendor);
                    var numLines = request.getLineCount({
                        group: 'custpage_report_sublist'
                    });
                   log.debug('numLines', numLines);
                  var numLines1 = request.getLineCount({
                        group: 'custpage_pdc_sublist'
                    });
                    log.debug('numLines1', numLines1);

                    var fileId = record.load({
                        type : 'subsidiary',
                        id : customerRec.getValue('subsidiary')
                    }).getValue('logo');

                    var fileObj = file.load({
                        id: fileId
                    });

                    log.debug('fileObj', fileObj.url);
                     var balanceAmount = request.getSublistValue({
                            group: 'custpage_report_sublist',
                            name: 'custpage_balance',
                            line: (numLines-1)
                        });

                     var date = new Date().getDate() +"/"+ (parseFloat(new Date().getMonth())+parseFloat(1))+"/"+ new Date().getFullYear();

                    var xml = '<?xml version=\"1.0\"?><pdf><head><macrolist>'+
    '<macro id=\"nlheader\">    <table class=\"header\" style=\"width: 100%;\"><tr>  <td > <img src="'+fileObj.url+'" style="float:left; width: 150; height:55;"/> </td>'+
    '<td align=\"right\"><span class=\"title\">Statement</span></td>   </tr>    <tr>     <td></td>        <td align=\"right\"><b> '+date+'</b></td>    </tr></table>        </macro>   </macrolist>'+
    '<style type=\"text/css\">table { font-size: 9pt; table-layout: fixed; } th { font-weight: bold; font-size: 8pt; vertical-align: middle; padding: 5px 6px 3px; background-color: #e3e3e3; color: #333333; } td { padding: 4px 6px; } td p { align:left } b { font-weight: bold; color: #333333; } table.header td { padding: 0; font-size: 10pt; } table.footer td { padding: 0; font-size: 8pt; } table.itemtable th { padding-bottom: 10px; padding-top: 10px; } table.body td { padding-top: 2px; } td.addressheader { font-weight: bold; font-size: 8pt; padding-top: 6px; padding-bottom: 2px; } td.address { padding-top: 0; } span.title { font-size: 28pt; } span.number { font-size: 16pt; } div.remittanceSlip { width: 100%; height: 200pt; page-break-inside: avoid; page-break-after: avoid; } hr { border-top: 1px dashed #d3d3d3; width: 100%; color: #ffffff; background-color: #ffffff; height: 1px; } </style> </head>'+
     '<body header=\"nlheader\" header-height=\"13%\" footer=\"nlfooter\" footer-height=\"20pt\" padding=\"0.5in 0.5in 0.5in 0.5in\" size=\"Letter-LANDSCAPE\">'+
     ' <table style=\"width: 100%; margin-top: 10px;\"><tr>    <td class=\"addressheader\" colspan=\"3\">Customer Name :'+customerId+'</td>'+
     ' </tr>    <tr>    <td class=\"address\" colspan=\"3\">'+customerAddress+'</td>    </tr>   <tr><td colspan=\"3\"><b>Statement From :'+startDate+' To : '+endDate+'</b></td></tr></table>'+
     '<table class=\"body\" style=\"width: 100%;\"><tr>    <th align=\"right\">Amount Due</th>    </tr>    <tr>'+
     '<td align=\"right\">'+balanceAmount+'</td>    </tr></table>'+
'<table class=\"itemtable\" style=\"width: 100%; margin-top: 10px;\">'+
'<thead> <tr> <th colspan=\"3\">Date</th> <th colspan=\"4\">Type</th> <th colspan=\"5\">Doc No</th> <th colspan=\"3\">Status</th> <th colspan=\"8\">Memo</th> <th align=\"right\" colspan=\"4\">Debit</th> <th align=\"right\" colspan=\"4\">Credit</th> <th align=\"right\" colspan=\"4\">Balance</th> </tr> </thead>';
 
  
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
                        '<Cell ss:StyleID="s63"><Data ss:Type="String">' + customerId + '</Data></Cell>' +
                        '</Row>';
                    xmlStr += '<Row>' +
                        '</Row>';
                    xmlStr += '<Row>' +
                        '</Row>';
                    xmlStr += '<Row>' +
                        '<Cell ss:StyleID="s64"><Data ss:Type="String"><b>Date</b> </Data></Cell>' +
                        '<Cell ss:StyleID="s64"><Data ss:Type="String"><b>Type </b></Data></Cell>' +
                        '<Cell ss:StyleID="s64"><Data ss:Type="String"><b>Document No</b></Data></Cell>' +
                        '<Cell ss:StyleID="s64"><Data ss:Type="String"><b>Status</b></Data></Cell>' +
                        '<Cell ss:StyleID="s64"><Data ss:Type="String"><b>Memo </b></Data></Cell>' +
                        '<Cell ss:StyleID="s64"><Data ss:Type="String"><b>Amount </b></Data></Cell>' +
                        '<Cell ss:StyleID="s64"><Data ss:Type="String"><b>DR </b></Data></Cell>' +
                        '<Cell ss:StyleID="s64"><Data ss:Type="String"><b>CR </b></Data></Cell>' +
                        '<Cell ss:StyleID="s64"><Data ss:Type="String"><b>Balanace</b></Data></Cell>' +
                        '</Row>';
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
                        '</Row>';
                    for (var i = 0; i < numLines; i++) {
                        var date = request.getSublistValue({
                            group: 'custpage_report_sublist',
                            name: 'custpage_tran_date_text',
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
                        var amount = request.getSublistValue({
                            group: 'custpage_report_sublist',
                            name: 'custpage_amount',
                            line: i
                        });
                        var debitAmount = request.getSublistValue({
                            group: 'custpage_report_sublist',
                            name: 'custpage_debit_charge',
                            line: i
                        });
                        if(debitAmount){
                             debitAmount = addZeroes(debitAmount.toString());
                        }
                       
                        var creditAmount = request.getSublistValue({
                            group: 'custpage_report_sublist',
                            name: 'custpage_credit_payment',
                            line: i
                        });

                        if(creditAmount){
                            creditAmount = addZeroes(creditAmount.toString());
                        }
                        
                        var balanceAmount = request.getSublistValue({
                            group: 'custpage_report_sublist',
                            name: 'custpage_balance',
                            line: i
                        });

                        if(balanceAmount){
                            balanceAmount = addZeroes(balanceAmount.toString());
                        }
                        var memo = request.getSublistValue({
                            group: 'custpage_report_sublist',
                            name: 'custpage_memo',
                            line: i
                        });
                        log.debug('date', date);

                        if(i == 0){
                            date = "<b>Balance Forward</b>";
                        }

                        if(i != numLines-1){
                             xml +=' <tr>'+
                                '<td colspan="3">' + (date ? (date) : '') + '</td>'+
                                '<td colspan="4">' + (type ? type : '') + '</td>'+
                                '<td colspan="5">' + (docNo ? docNo : '') + '</td>'+
                                '<td colspan="3">' + (status ? status : '') + '</td>'+
                                '<td colspan="8">' + (memo ? memo : '') + '</td>'+
                                '<td align="right" colspan="4">' + (debitAmount ? debitAmount : '') + '</td>'+
                                '<td align="right" colspan="4">' + (creditAmount ? creditAmount : '') + '</td>'+
                                '<td align="right" colspan="4">' + (balanceAmount ? balanceAmount : '') + '</td>'+
                                '</tr>';
                            }else{
                                 xml +=' <tr>'+
                                '<th colspan="3"><b>End Balance</b></th>'+
                                '<th colspan="4">' + (type ? type : '') + '</th>'+
                                '<th colspan="5">' + (docNo ? docNo : '') + '</th>'+
                                '<th colspan="3">' + (status ? status : '') + '</th>'+
                                '<th colspan="8">' + (memo ? memo : '') + '</th>'+
                                '<th align="right" colspan="4">' + (debitAmount ? debitAmount : '') + '</th>'+
                                '<th align="right" colspan="4">' + (creditAmount ? creditAmount : '') + '</th>'+
                                '<th align="right" colspan="4">' + (balanceAmount ? balanceAmount : '') + '</th>'+
                                '</tr>';
                            }

                       
                        xmlStr += '<Row>' +
                            '<Cell><Data ss:Type="String">' + (date ? (date) : '') + '</Data></Cell>' +
                            '<Cell><Data ss:Type="String">' + (type ? type : '') + '</Data></Cell>' +
                            '<Cell><Data ss:Type="String">' + (docNo ? docNo : '') + '</Data></Cell>' +
                            '<Cell><Data ss:Type="String">' + (status ? status : '') + '</Data></Cell>' +
                            '<Cell><Data ss:Type="String">' + (memo ? memo : '') + '</Data></Cell>' +
                            '<Cell><Data ss:Type="Number">' + (amount ? amount : '') + '</Data></Cell>' +
                            '<Cell><Data ss:Type="Number">' + (debitAmount ? debitAmount : '') + '</Data></Cell>' +
                            '<Cell><Data ss:Type="Number">' + (creditAmount ? creditAmount : '') + '</Data></Cell>' +
                            '<Cell><Data ss:Type="Number">' + (balanceAmount ? balanceAmount : '') + '</Data></Cell>' +
                            '</Row>';
                    }
                    xmlStr += '</Table></Worksheet></Workbook>';
                    log.debug('xmlStr', xmlStr);
                     xml += ' </table></body></pdf>';
                    xml = xml.replace(/\&/g, "&amp;");
                    var pdfFile = render.xmlToPdf({
                        xmlString: xml
                    });

                     var renderer = render.create();
                     renderer.templateContent = xml;
                     var statementPdf = renderer.renderAsPdf();


                    var reencoded = encode.convert({
                        string: xmlStr,
                        inputEncoding: encode.Encoding.UTF_8,
                        outputEncoding: encode.Encoding.BASE_64
                    });
                    var fileObj = file.create({
                        name: 'Customer Statement ' + new Date() + '.xls',
                        fileType: file.Type.EXCEL,
                        contents: reencoded,
                        //                  encoding: file.Encoding.BASE_64,
                        folder: -10,
                        isOnline: true
                    });

                    response.writeFile(statementPdf);
                    //var fileId = fileObj.save();
                    //log.debug('fileId',fileId);
                    response.writeFile(fileObj);
                }
                context.response.writePage(form);
                form.clientScriptModulePath = './DA_CS_Customer_Statement_without_PDC_Attachment.js';
            } catch (ex) {
                log.error(ex.name, ex.message);
            }
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

        function contains(arr, element) {
            for (var i = 0; i < arr.length; i++) {
                if (arr[i] === element) {
                    return true;
                }
            }
            return false;
        }
        return {
            onRequest: onRequest
        };
    });
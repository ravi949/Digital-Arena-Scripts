/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope TargetAccount
 */
define(['N/ui/serverWidget', 'N/search', 'N/format', 'N/encode', 'N/file','N/record','N/render'],
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
                        label: 'Report'
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
                    /*.updateLayoutType({
                        layoutType: ui.FieldLayoutType.STARTROW
                    });
                    endDateField.updateDisplaySize({
                        height: 250,
                        width: 440
                    });*/
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
                        label: 'Date'
                    });
                    var dateField = reportList.addField({
                        id: 'custpage_tran_date_text',
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
                    reportList.addField({
                        id: 'custpage_type',
                        type: ui.FieldType.TEXT,
                        label: 'Type'
                    }).updateDisplayType({
                        displayType: ui.FieldDisplayType.HIDDEN
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
                    }).updateDisplayType({
                        displayType: ui.FieldDisplayType.HIDDEN
                    });
                    reportList.addField({
                        id: 'custpage_due_date',
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
                        label: 'Balance'
                    });
                    reportList.addField({
                        id: 'custpage_cf_unapplied_vendor_pp_amount',
                        type: ui.FieldType.CURRENCY,
                        label: 'CF UnApplied Vendor Prepayment Amount'
                    }).updateDisplayType({
                        displayType: ui.FieldDisplayType.HIDDEN
                    });
                    var balance = 0;
                    var cfVendorPrepaymentAmount = 0;
                  if (request.parameters.vendorId) {
                    if (request.parameters.startDate || request.parameters.vendorId || request.parameters.endDate) {
                        // log.debug('params');
                        var firstDateString;
                        vendorField.defaultValue = request.parameters.vendorId;
                        if (request.parameters.endDate != "") {
                            //log.debug('sd', new Date(request.parameters.startDate));
                            var startTomorrow = new Date(request.parameters.startDate);
                            startTomorrow.setDate(startTomorrow.getDate() + 1);
                            startDateField.defaultValue = startTomorrow;
                            var endTomorrow = new Date(request.parameters.endDate)
                            endTomorrow.setDate(endTomorrow.getDate() + 1)
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
                                        ["type", "anyof", "Journal"], "AND", ["accounttype", "anyof", "AcctPay"]
                                    ], "OR", ["type", "anyof", "VendBill", "VendCred", "VendPymt", "VPrepApp"]
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
                            type: "vendorprepayment",
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
                        // log.debug("vendorprepaymentSearchObj result count",searchResultCount);
                        if (vendorId) {
                            vendorprepaymentSearchObj.filters.push(search.createFilter({
                                "name": "name",
                                "operator": "anyof",
                                "values": vendorId
                            }));
                        }
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
                        id: 'custpage_balance',
                        line: 0,
                        value:  balance 
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
                    // log.audit('dataCount', dataCount);
                    var transactionSearchObj = search.create({
                        type: "transaction",
                        filters: [
                            ["mainline", "is", "T"],
                            "AND",
                            [
                                [
                                    ["type", "anyof", "Journal"], "AND", ["accounttype", "anyof", "AcctPay"]
                                ], "OR", ["type", "anyof", "VendBill", "VendCred", "VendPymt", "VPrepApp", "VPrep"]
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
                                name:'custbody_da_vp_unapplied_amount',
                                label:'Unapplied Amount'
                            })
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
                    };
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
                        })
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
                            reportList.setSublistValue({
                                id: 'custpage_tran_date',
                                line: i,
                                value: "<html><style type='text/css'>a { text-decoration:none; }</style><a href=/app/accounting/transactions/" + typeText + ".nl?id=" + result.id + "&whence=><font color='#255599'>" + date + "</font></a></html>"
                            });
                            reportList.setSublistValue({
                                id: 'custpage_tran_date_text',
                                line: i,
                                value: date
                            })
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
                          if(memo){
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
                            if (type == "Bill") {
                                currentAmount = -(result.getValue('amount'));
                                reportList.setSublistValue({
                                    id: 'custpage_billed',
                                    line: i,
                                    value: (result.getValue('amount'))
                                });
                            }
                            if (type == "Vendor Prepayment Application" || type == "Bill Payment" || type == "Bill Credit") {
                                currentAmount = -(result.getValue('amount'));
                                reportList.setSublistValue({
                                    id: 'custpage_paid',
                                    line: i,
                                    value: -(result.getValue('amount'))
                                });
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
                } 
                }
                  else {

                    log.debug('params', request.parameters);

                    var startDate = request.parameters.custpage_ss_start_date;
                    var endDate = request.parameters.custpage_ss_end_date;
                    var vendor = request.parameters.custpage_ss_vendor;

                    vendor = record.load({
                        type:'vendor',
                        id: vendor
                    }).getValue('entityid');

                    log.debug('startDate', startDate);
                    log.debug('endDate', endDate);
                    log.debug('vendor', vendor);
                    var numLines = request.getLineCount({
                        group: 'custpage_report_sublist'
                    });
                    log.debug('numLines', numLines);
                    var date = new Date().getDate() +"/"+ (parseFloat(new Date().getMonth())+parseFloat(1))+"/"+ new Date().getFullYear();
                     var xml = '<?xml version=\"1.0\"?><pdf><head><macrolist>'+
    '<macro id=\"nlheader\">    <table class=\"header\" style=\"width: 100%;\"><tr>  <td >  </td>'+
    '<td align=\"right\"><span class=\"title\">Vendor Statement</span></td>   </tr>    <tr>     <td></td>        <td align=\"right\"><b> '+date+'</b></td>    </tr></table>        </macro>   </macrolist>'+
    '<style type=\"text/css\">table { font-size: 9pt; table-layout: fixed; } th { font-weight: bold; font-size: 8pt; vertical-align: middle; padding: 5px 6px 3px; background-color: #e3e3e3; color: #333333; } td { padding: 4px 6px; } td p { align:left } b { font-weight: bold; color: #333333; } table.header td { padding: 0; font-size: 10pt; } table.footer td { padding: 0; font-size: 8pt; } table.itemtable th { padding-bottom: 10px; padding-top: 10px; } table.body td { padding-top: 2px; } td.addressheader { font-weight: bold; font-size: 8pt; padding-top: 6px; padding-bottom: 2px; } td.address { padding-top: 0; } span.title { font-size: 28pt; } span.number { font-size: 16pt; } div.remittanceSlip { width: 100%; height: 200pt; page-break-inside: avoid; page-break-after: avoid; } hr { border-top: 1px dashed #d3d3d3; width: 100%; color: #ffffff; background-color: #ffffff; height: 1px; } </style> </head>'+
     '<body header=\"nlheader\" header-height=\"13%\" footer=\"nlfooter\" footer-height=\"20pt\" padding=\"0.5in 0.5in 0.5in 0.5in\" size=\"A4\">'+
     ' <table style=\"width: 100%; margin-top: 10px;\"><tr>    <td class=\"addressheader\" colspan=\"3\">Vendor Name :'+vendor+'</td>'+
     ' </tr>    <tr>    <td class=\"address\" colspan=\"3\"></td>    </tr>   <tr><td colspan=\"3\"><b>Statement From :'+startDate+' To : '+endDate+'</b></td></tr></table>'+
'<table style=\"width: 100%; margin-top: 10px;\">'+
' <tr> <th colspan=\"6\">Date</th> <th colspan=\"5\">Document</th><th colspan=\"8\">Memo</th> <th align=\"right\" colspan=\"4\">DR</th> <th align=\"right\" colspan=\"4\">CR</th> <th align=\"right\" colspan=\"4\">Balance</th> </tr> ';
                    var xmlStr = '<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>';
                    xmlStr += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" ';
                    xmlStr += 'xmlns:o="urn:schemas-microsoft-com:office:office" ';
                    xmlStr += 'xmlns:x="urn:schemas-microsoft-com:office:excel" ';
                    xmlStr += 'xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" ';
                    xmlStr += 'xmlns:html="http://www.w3.org/TR/REC-html40">';
                    
                    xmlStr += '<Styles>'
                             + '<Style ss:ID="s63">'
                             + '<Font x:CharSet="204" ss:Size="12" ss:Color="#B3C235" ss:Bold="1" ss:Underline="Single"/>'
                             + '</Style><Style ss:ID="s64">'
                             + '<Font x:CharSet="204" ss:Size="12" ss:Color="#EC1848" ss:Bold="1" />'
                             + '</Style>'
                             + '</Styles>';
                    xmlStr += '<Worksheet ss:Name="Sheet1">';
                    xmlStr += '<Table>' ;
                    xmlStr += '<Row>' +
                        '<Cell ss:StyleID="s63"><Data ss:Type="String"><b>Start Date</b> </Data></Cell>' +
                        '<Cell ss:StyleID="s63"><Data ss:Type="String"><b>End Date</b></Data></Cell>' +
                        '<Cell ss:StyleID="s63"><Data ss:Type="String"><b>Vendor </b></Data></Cell>'+
                        '</Row>';
                    xmlStr += '<Row>' +
                        '<Cell ss:StyleID="s63"><Data ss:Type="String"> '+startDate+' </Data></Cell>' +
                        '<Cell ss:StyleID="s63"><Data ss:Type="String">'+endDate+'</Data></Cell>' +
                        '<Cell ss:StyleID="s63"><Data ss:Type="String">'+vendor+'</Data></Cell>'+
                        '</Row>';
                        xmlStr += '<Row>'+
                        '</Row>';
                        xmlStr += '<Row>' +
                        '</Row>';
                    xmlStr += '<Row>' +
                        '<Cell ss:StyleID="s64"><Data ss:Type="String"><b>Date</b> </Data></Cell>' +
                        '<Cell ss:StyleID="s64"><Data ss:Type="String"><b>Document No</b></Data></Cell>' +
                        '<Cell ss:StyleID="s64"><Data ss:Type="String"><b>Memo </b></Data></Cell>' +
                        '<Cell ss:StyleID="s64"><Data ss:Type="String"><b>DR </b></Data></Cell>' +
                        '<Cell ss:StyleID="s64"><Data ss:Type="String"><b>CR </b></Data></Cell>' +
                        '<Cell ss:StyleID="s64"><Data ss:Type="String"><b>Balanace</b></Data></Cell>' +
                        '</Row>';
                    xmlStr += '<Row>' +
                        '<Cell><Data ss:Type="String"></Data></Cell>' +
                        '<Cell><Data ss:Type="String"></Data></Cell>' +
                        '<Cell><Data ss:Type="String"></Data></Cell>' +
                        '<Cell><Data ss:Type="String"> </Data></Cell>' +
                        '<Cell><Data ss:Type="String"></Data></Cell>' +
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
                        var paidAmount = request.getSublistValue({
                            group: 'custpage_report_sublist',
                            name: 'custpage_paid',
                            line: i
                        });
                        var balanceAmount = request.getSublistValue({
                            group: 'custpage_report_sublist',
                            name: 'custpage_balance',
                            line: i
                        });
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
                        xml+=' <tr> <td colspan=\"6\">' + (date ? (date) : '') + '</td> <td colspan=\"5\">' + (docNo ? docNo: '') + '</td><td colspan=\"8\">' + (memo ? memo: '') + '</td> <td align=\"right\" colspan=\"4\">' + (paidAmount ? paidAmount : '') + '</td> <td align=\"right\" colspan=\"4\">' + (billedAmount ? billedAmount :'') + '</td> <td align=\"right\" colspan=\"4\">' + (balanceAmount ? balanceAmount :'') + '</td> </tr> ';
                        xmlStr += '<Row>' +
                            '<Cell><Data ss:Type="String">' + (date ? (date) : '') + '</Data></Cell>' +
                            '<Cell><Data ss:Type="String">' + (docNo ? docNo: '') + '</Data></Cell>' +
                            '<Cell><Data ss:Type="String">' + (memo ? memo: '') + '</Data></Cell>' +
                            '<Cell><Data ss:Type="Number">' + (paidAmount ? paidAmount : '') + '</Data></Cell>' +
                            '<Cell><Data ss:Type="Number">' + (billedAmount ? billedAmount :'') + '</Data></Cell>' +
                            '<Cell><Data ss:Type="Number">' + (balanceAmount ? balanceAmount : '') + '</Data></Cell>' +
                            '</Row>';
                    }
                    xml += ' </table>';
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
                form.clientScriptModulePath = './DA_CS_Supplier_External_Attach.js';
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

        function functioncallingwithoutparams() {
            var transactionSearchObj = search.create({
                type: "transaction",
                filters: [
                    ["name", "anyof", "734"],
                    "AND",
                    ["mainline", "is", "T"],
                    "AND",
                    ["type", "anyof", "VendBill", "VendCred", "VendPymt", "Journal", "VPrepApp", "VPrep"]
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
        return {
            onRequest: onRequest
        };
    });
/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope TargetAccount
 */
define(['N/ui/serverWidget', 'N/search', 'N/format', 'N/encode', 'N/file', 'N/record', 'N/render'],
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
                var empid = request.parameters.empId;
                log.debug('empid',empid);
                log.debug('params', (request.parameters));
                if (context.request.method === 'GET') {

                    var form = ui.createForm({
                        title: 'Employees Loan Report'
                    });
                    form.addSubmitButton({
                        label: 'Print PDF'
                    });
                    var tab = form.addSubtab({
                        id: 'custpage_loan_tab',
                        label: 'Loans'
                    });
                    var employeeField = form.addField({
                        id: 'custpage_emp_list',
                        type: ui.FieldType.SELECT,
                        label: 'Employee',
                        source: 'Employee',
                        container: 'custpage_loan_tab'

                    });

                    var LoanList = form.addSublist({
                        id: 'custpage_loan_sublist',
                        type: ui.SublistType.LIST,
                        label: 'Loan',
                        tab: 'custpage_loan_tab'
                    });

                   if (request.parameters.empId) {
                        employeeField.defaultValue = request.parameters.empId;
                        var loanId = LoanList.addField({
                            id: 'custpage_loan_id',
                            type: ui.FieldType.TEXT,
                            label: 'Loan Id'
                        });
                        var loanhideId = LoanList.addField({
                            id: 'custpage_loan_id_1',
                            type: ui.FieldType.TEXT,
                            label: 'Loan Id'
                        }).updateDisplayType({
                            displayType: ui.FieldDisplayType.HIDDEN
                        });

                        var loanType = LoanList.addField({
                            id: 'custpage_loan_type',
                            type: ui.FieldType.TEXT,
                            label: 'Loan Type'
                        });
                        var loanSdate = LoanList.addField({
                            id: 'custpage_loan_sdate',
                            type: ui.FieldType.TEXT,
                            label: 'Loan Start Date'
                        });
                        var loanAmt = LoanList.addField({
                            id: 'custpage_loan_amt',
                            type: ui.FieldType.CURRENCY,
                            label: 'Loan Amount'
                        });
                        var paidAmt = LoanList.addField({
                            id: 'custpage_paid_amt',
                            type: ui.FieldType.CURRENCY,
                            label: 'Paid Amount'
                        });
                        var paidAmt = LoanList.addField({
                            id: 'custpage_rem_amt',
                            type: ui.FieldType.CURRENCY,
                            label: 'Remaining Amount'
                        });
                        var status = LoanList.addField({
                            id: 'custpage_loan_status',
                            type: ui.FieldType.TEXT,
                            label: 'Approval Status'
                        });
                  

                        var customrecord_da_hr_employee_loanSearchObj = search.create({
                            type: "customrecord_da_hr_employee_loan",
                            filters: [
                                ["custrecord_da_employee_loan", "anyof", request.parameters.empId]
                            ],
                            columns: [
                                search.createColumn({
                                    name: "custrecord_da_approve_status",
                                    label: "Approval Status"
                                }),
                                search.createColumn({
                                    name: "custrecord_da_loan_start_date",
                                    label: "Start Date"
                                }),
                                search.createColumn({
                                    name: "custrecord_da_loan_total_amount",
                                    label: "Total Amount"
                                }),
                                search.createColumn({
                                    name: "custrecord_da_payroll_item_loan",
                                    label: "Type"
                                }),
                                search.createColumn({
                                    name: "name",
                                    label: "ID"
                                })
                            ]
                        });
                        var searchResultCount = customrecord_da_hr_employee_loanSearchObj.runPaged().count;
                        log.debug("customrecord_da_hr_employee_loanSearchObj result count", searchResultCount);

                        var i = 0;
                        customrecord_da_hr_employee_loanSearchObj.run().each(function(result) {

                            var paidAmount = 0;
                            var customrecord_da_hr_loan_installmentSearchObj = search.create({
                                type: "customrecord_da_hr_loan_installment",
                                filters: [
                                    ["custrecord_da_hr_loan_id", "anyof", result.id],
                                    "AND",
                                    ["custrecord_da_hr_loan_paid", "is", "T"]
                                ],
                                columns: [
                                    search.createColumn({
                                        name: "custrecord_da_installment_amount_hr",
                                        summary: "SUM",
                                        label: "Installment Amount"
                                    })
                                ]
                            });
                            var searchResultCount = customrecord_da_hr_loan_installmentSearchObj.runPaged().count;
                            log.debug("customrecord_da_hr_loan_installmentSearchObj result count", searchResultCount);
                            customrecord_da_hr_loan_installmentSearchObj.run().each(function(result) {
                                paidAmount = result.getValue({
                                    name: 'custrecord_da_installment_amount_hr',
                                    summary: search.Summary.SUM
                                });
                                return true;
                            });

                            paidAmount = (paidAmount) ? paidAmount : 0

                            var status = result.getText('custrecord_da_approve_status');
                            var startDate = result.getValue('custrecord_da_loan_start_date');
                            var amount = result.getValue('custrecord_da_loan_total_amount');
                            var type = result.getText('custrecord_da_payroll_item_loan');
                            var id = result.getValue('name');
                            var remainingAmount = parseFloat(amount) - parseFloat(paidAmount);

                            LoanList.setSublistValue({
                                id: 'custpage_loan_id_1',
                                line: i,
                                value: (id) ? id : ' '
                            });
                            LoanList.setSublistValue({
                                id: 'custpage_loan_id',
                                line: i,
                                value: "<html><style type='text/css'>a { text-decoration:none; }</style><a href=/app/common/custom/custrecordentry.nl?rectype=273&id=" + result.id + "&whence=><font color='#255599'>" + result.getValue('name') + "</font></a></html>"
                            });
                            LoanList.setSublistValue({
                                id: 'custpage_loan_type',
                                line: i,
                                value: (type) ? type : ' '
                            });
                            LoanList.setSublistValue({
                                id: 'custpage_loan_sdate',
                                line: i,
                                value: (startDate) ? startDate : ' '
                            });
                            LoanList.setSublistValue({
                                id: 'custpage_loan_amt',
                                line: i,
                                value: (amount) ? amount : 0
                            });
                            LoanList.setSublistValue({
                                id: 'custpage_paid_amt',
                                line: i,
                                value: (paidAmount) ? paidAmount : 0
                            });
                            LoanList.setSublistValue({
                                id: 'custpage_rem_amt',
                                line: i,
                                value: (remainingAmount) ? remainingAmount : 0
                            });
                            LoanList.setSublistValue({
                                id: 'custpage_loan_status',
                                line: i,
                                value: (status) ? status : ' '
                            });
                            i++;
                            return true;
                        });
                    } else {

                        var Employee = LoanList.addField({
                            id: 'custpage_emp_name',
                            type: ui.FieldType.TEXT,
                            label: 'Employee'
                        });
                        var loanType = LoanList.addField({
                            id: 'custpage_loan_type',
                            type: ui.FieldType.TEXT,
                            label: 'Loan Type'
                        });

                        var loanAmt = LoanList.addField({
                            id: 'custpage_loan_amt',
                            type: ui.FieldType.CURRENCY,
                            label: 'Loan Amount'
                        });
                        var paidAmt = LoanList.addField({
                            id: 'custpage_paid_amt',
                            type: ui.FieldType.CURRENCY,
                            label: 'Paid Amount'
                        });
                        var paidAmt = LoanList.addField({
                            id: 'custpage_rem_amt',
                            type: ui.FieldType.CURRENCY,
                            label: 'Remaining Amount'
                        });




                        var customrecord_da_hr_employee_loanSearchObj = search.create({
                            type: "customrecord_da_hr_employee_loan",
                            filters: [
                                ["custrecord_da_payroll_item_loan", "noneof", "@NONE@"]
                            ],
                            columns: [
                                search.createColumn({
                                    name: "custrecord_da_loan_total_amount",
                                    summary: "SUM",
                                    label: "Total Amount"
                                }),
                                search.createColumn({
                                    name: "custrecord_da_payroll_item_loan",
                                    summary: "GROUP",
                                    label: "Type"
                                }),
                                search.createColumn({
                                    name: "custrecord_da_employee_loan",
                                    summary: "GROUP",
                                    label: "Employee"
                                })
                            ]
                        });
                        var searchResultCount = customrecord_da_hr_employee_loanSearchObj.runPaged().count;
                        log.debug("customrecord_da_hr_employee_loanSearchObj result count", searchResultCount);
                        var i = 0;
                        customrecord_da_hr_employee_loanSearchObj.run().each(function(result) {
                            var employeeId = result.getValue({
                                name: 'custrecord_da_employee_loan',
                                summary: search.Summary.GROUP
                            });
                            var loanType = result.getValue({
                                name: 'custrecord_da_payroll_item_loan',
                                summary: search.Summary.GROUP
                            });
                            var loanTypeText = result.getText({
                                name: 'custrecord_da_payroll_item_loan',
                                summary: search.Summary.GROUP
                            });

                            var amount = result.getValue({
                                name: 'custrecord_da_loan_total_amount',
                                summary: search.Summary.SUM
                            });
                            var employeeName = result.getText({
                                name: 'custrecord_da_employee_loan',
                                summary: search.Summary.GROUP
                            });

                            amount = (amount) ? amount : 0;

                            var customrecord_da_hr_loan_installmentSearchObj = search.create({
                                type: "customrecord_da_hr_loan_installment",
                                filters: [
                                    ["custrecord_da_hr_loan_id.custrecord_da_employee_loan", "anyof", employeeId],
                                    "AND",
                                    ["custrecord_da_hr_loan_id.custrecord_da_payroll_item_loan", "anyof", loanType],
                                    "AND",
                                    ["custrecord_da_hr_loan_paid", "is", "T"]
                                ],
                                columns: [
                                    search.createColumn({
                                        name: "custrecord_da_installment_amount_hr",
                                        summary: "SUM",
                                        label: "Installment Amount"
                                    })
                                ]
                            });

                            var paidAmount = 0;
                            var searchResultCount = customrecord_da_hr_loan_installmentSearchObj.runPaged().count;
                            log.debug("customrecord_da_hr_loan_installmentSearchObj result count", searchResultCount);
                            customrecord_da_hr_loan_installmentSearchObj.run().each(function(result) {
                                paidAmount = result.getValue({
                                    name: 'custrecord_da_installment_amount_hr',
                                    summary: search.Summary.SUM
                                });
                                return true;
                            });

                            paidAmount = (paidAmount) ? paidAmount : 0;

                            var remainingAmount = parseFloat(amount) - parseFloat(paidAmount);


                            LoanList.setSublistValue({
                                id: 'custpage_emp_name',
                                line: i,
                                value: (employeeName) ? employeeName : ' '
                            });
                            LoanList.setSublistValue({
                                id: 'custpage_loan_type',
                                line: i,
                                value: (loanTypeText) ? loanTypeText : ' '
                            });
                            LoanList.setSublistValue({
                                id: 'custpage_loan_amt',
                                line: i,
                                value: (amount) ? amount : 0
                            });
                            LoanList.setSublistValue({
                                id: 'custpage_paid_amt',
                                line: i,
                                value: (paidAmount) ? paidAmount : 0
                            });
                            LoanList.setSublistValue({
                                id: 'custpage_rem_amt',
                                line: i,
                                value: (remainingAmount) ? remainingAmount : 0
                            });
                            i++;

                            return true;
                        });

                    }


                } else {
                  var emp2=request.parameters.custpage_emp_list;
                   log.debug('emp1',emp2);
                    var numLines = request.getLineCount({
                        group: 'custpage_loan_sublist'
                    });

                    var fileObj = file.load({
                        id: 399
                    });

                    log.debug('fileObj', fileObj.url);
                    var xml = '<?xml version=\"1.0\"?><pdf><head><macrolist>' +
                        '<macro id=\"nlheader\">    <table class=\"header\" style=\"width: 100%;\"><tr>  <td > <img src="' + fileObj.url + '" style="float:left; width: 130; height:40;"/> </td>' +
                        '<td align=\"right\"><span class=\"title\"><p font-size="17pt">LOAN REPORT</p></span></td></tr>    </table> </macro> </macrolist>' +
                        '<style type=\"text/css\">table { font-size: 9pt; table-layout: fixed; } th { font-weight: bold; font-size: 8pt; vertical-align: middle; padding: 5px 6px 3px; background-color: #e3e3e3; color: #333333; } td { padding: 4px 6px; } td p { align:left } b { font-weight: bold; color: #333333; } table.header td { padding: 0; font-size: 10pt; } table.footer td { padding: 0; font-size: 8pt; } table.itemtable th { padding-bottom: 10px; padding-top: 10px; } table.body td { padding-top: 2px; } td.addressheader { font-weight: bold; font-size: 8pt; padding-top: 6px; padding-bottom: 2px; } td.address { padding-top: 0; } span.title { font-size: 28pt; } span.number { font-size: 16pt; } div.remittanceSlip { width: 100%; height: 200pt; page-break-inside: avoid; page-break-after: avoid; } hr { border-top: 1px soild #d3d3d3; width: 100%; color: #ffffff; background-color: #ffffff; height: 2px; } </style> </head>' +
                        '<body header=\"nlheader\" header-height=\"7%\" footer=\"nlfooter\" footer-height=\"20pt\" padding=\"0.5in 0.5in 0.5in 0.5in\" size=\"A4\">' +
                        '<hr></hr>' +
                        ' <table style=\"width: 100%; margin-top: 10px;\"><tr>    <td ><p font-size="10pt"><b>Employee Id</b></p></td><td colspan="2" align="left"><b>:</b></td><td></td>' +
                        ' </tr>    <tr>    <td ><p font-size="10pt"><b>Employee Name</b></p></td> <td colspan="2" align="left"><b>:</b></td><td></td> </tr>   <tr><td ><p font-size="10pt"><b>Hire Date</b></p></td><td colspan="2" align="left"><b>:</b></td><td></td></tr></table>' +

                        ' <table class=\"itemtable\" style=\"width: 100%; margin-top: 20px;border:1px\"> if (emp2) {  <thead> <tr><th>Loan Id</th><th>Loan Type</th><th><p align="center">Loan Start Date</p></th><th><p align="center">Loan Amount</p></th><th><p align="center">Paid Amount</p></th><th><p align="center">Remaining Amount</p></th><th><p align="center">Approval Status</p></th></tr></thead>';
                    for (var i = 0; i < numLines; i++) {
                        var loanId1 = request.getSublistValue({
                            group: 'custpage_loan_sublist',
                            name: 'custpage_loan_id_1',
                            line: i
                        });
                        var loanType1 = request.getSublistValue({
                            group: 'custpage_loan_sublist',
                            name: 'custpage_loan_type',
                            line: i
                        });
                        var loanSdate1 = request.getSublistValue({
                            group: 'custpage_loan_sublist',
                            name: 'custpage_loan_sdate',
                            line: i
                        });
                        var loanamt1 = request.getSublistValue({
                            group: 'custpage_loan_sublist',
                            name: 'custpage_loan_amt',
                            line: i
                        });
                        var paidamt1 = request.getSublistValue({
                            group: 'custpage_loan_sublist',
                            name: 'custpage_paid_amt',
                            line: i
                        });
                        var remainingamt1 = request.getSublistValue({
                            group: 'custpage_loan_sublist',
                            name: 'custpage_rem_amt',
                            line: i
                        });
                        var status1 = request.getSublistValue({
                            group: 'custpage_loan_sublist',
                            name: 'custpage_loan_status',
                            line: i
                        });
                        xml += ' <tr>' +
                            '<td >' + (loanId1 ? (loanId1) : '') + '</td>' +
                            '<td >' + (loanType1 ? loanType1 : '') + '</td>' +
                            '<td align="center" >' + (loanSdate1 ? loanSdate1 : '') + '</td>' +
                            '<td align="center">' + (loanamt1 ? loanamt1 : '') + '</td>' +
                            '<td align="center">' + (paidamt1 ? paidamt1 : '') + '</td>' +
                            '<td align="center">' + (remainingamt1 ? remainingamt1 : '') + '</td>' +
                            '<td  ><p align="center">' + (status1 ? status1 : '') + '</p></td>' +

                            '</tr>';

                    }

                    xml += '  }</table></body></pdf>';
                    xml = xml.replace(/\&/g, "&amp;");
                    var pdfFile = render.xmlToPdf({
                        xmlString: xml
                    });

                    var renderer = render.create();
                    renderer.templateContent = xml;
                    var statementPdf = renderer.renderAsPdf();




                    response.writeFile(statementPdf);
                    //var fileId = fileObj.save();
                    //log.debug('fileId',fileId);
                    //response.writeFile(fileObj);
                }

                context.response.writePage(form);
                form.clientScriptModulePath = './DA CS Employees Loan Report.js';




            } catch (ex) {
                log.error(ex.name, ex.message);
            }
        }


        return {
            onRequest: onRequest
        };
    });
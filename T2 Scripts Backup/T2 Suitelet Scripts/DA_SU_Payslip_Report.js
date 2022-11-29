/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope TargetAccount
 */
define(['N/ui/serverWidget', 'N/search', 'N/format', 'N/encode', 'N/file', 'N/record','N/render','N/url'],
    function(ui, search, format, encode, file, record, render,url) {
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
             var params = context.request.parameters;
                var request = context.request;
                var response = context.response;
                log.debug('params', (request.parameters));
                if (context.request.method === 'GET') {
                  
                  var payslipRec = record.load({
                        type : 'customrecord_emp_request_for_payslip',
                        id :params.id
                    });
                  var employeeId = payslipRec.getValue('custrecord_payslip_employee');
                   var xml = '<?xml version=\"1.0\"?><pdf><head><macrolist>'+
    '<macro id=\"nlheader\"><table class=\"header\" style=\"width: 100%;\"><tr>  <td colspan=\"3\" align=\"center\" margin-left="10px" > </td></tr> </table>     </macro>'+
    '<macro id="nlfooter"><table class="footer" style="width: 100%;"><tr><td align="right"><pagenumber/> of <totalpages/></td></tr></table></macro>  </macrolist>'+
    '<style type=\"text/css\">table { font-size: 9pt; table-layout: fixed; } th { font-weight: bold; font-size: 8pt; vertical-align: middle; padding: 5px 6px 3px; background-color: #e3e3e3; color: #333333; } td { padding: 4px 6px;font-size:10pt; } td p { align:left }table.header td { padding: 0; font-size: 10pt; } table.footer td { padding: 0; font-size: 8pt; } table.itemtable th { padding-bottom: 10px; padding-top: 10px; } table.body td { padding-top: 2px;font-size:10pt; } td.addressheader { font-weight: bold; font-size: 8pt; padding-top: 6px; padding-bottom: 2px; } td.address { padding-top: 0; } span.title { font-size: 28pt; } span.number { font-size: 16pt; } div.remittanceSlip { width: 100%; height: 200pt; page-break-inside: avoid; page-break-after: avoid; } hr { border-top: 1px dashed #d3d3d3; width: 100%; color: #ffffff; background-color: #ffffff; height: 1px; } </style> </head>'+
     '<body header=\"nlheader\" header-height=\"8%\" footer=\"nlfooter\" footer-height=\"5%\" padding=\"0.1in 0.5in 0.2in 0.5in\" size=\"A4\">'+
                        '<br />';
       xml+='<table width="100%">'+
      '<tr>'+
       ' <td><p font-size="12pt" align="center"><b>PAY SLIP  For the Month of May 2021</b></p></td>'+
      '</tr>'+
    '</table>';
   xml+='<table border="1px" width="100%" margin-top="10px">'+
   '<tr>'+
     '<td border-right="1px" font-size="10pt"><b>Employee Name:</b></td>'+
     '<th border-right="1px" font-size="10pt"><b></b></th>'+
     '<td border-right="1px" font-size="10pt"><b>Working Days:</b></td>'+
     '<th font-size="10pt"></th>'+
   '</tr>'+
    '<tr>'+
     '<td border-right="1px" font-size="10pt"><b>Designation:</b></td>'+
     '<th border-right="1px" font-size="10pt"><b></b></th>'+
     '<td border-right="1px" font-size="10pt"><b>Net Payable Days:</b></td>'+
      '<th font-size="10pt"></th>'+
   '</tr>'+
    '<tr>'+
    '<td border-right="1px" font-size="10pt" hieght="25px"><b>Department:</b></td>'+
     '<th border-right="1px" font-size="10pt" hieght="25px"><b></b></th>'+
     '<td border-right="1px" font-size="10pt" hieght="25px"><b>Bank Name:</b></td>'+
      '<th font-size="10pt" hieght="25px"></th>'+
   '</tr>'+
   '<tr>'+
     '<td border-right="1px" font-size="10pt" hieght="25px"></td>'+
     '<th border-right="1px" font-size="10pt" hieght="25px"></th>'+
     '<td border-right="1px" font-size="10pt" hieght="25px"></td>'+
      '<th font-size="10pt" hieght="25px"></th>'+
   '</tr>'+
    '</table>'+
    '<table border="1px" width="100%" margin-top="15px">'+
       '<tr>'+
     '<td border-right="1px" border-bottom="1px" font-size="12pt"><b>Earnings</b></td>'+
     '<td border-right="1px" border-bottom="1px" font-size="12pt" align="center"><b>Amount(KWD)</b></td>'+
     '<td border-right="1px" border-bottom="1px" font-size="12pt"><b>Deductions</b></td>'+
     '<td font-size="12pt" border-bottom="1px" align="center"><b>Amount(KWD)</b></td>'+
   '</tr>';
       
        var earningsSearch = search.create({
                                  type: "customrecord_da_emp_earnings",
                                  filters: [
                                      ["custrecord_da_earnings_employee", "anyof",employeeId]
                                  ],
                                  columns: [
                                      search.createColumn({
                                          name: "custrecord_da_earnings_payroll_item",
                                          label: "Payroll Item"
                                      }),
                                      search.createColumn({
                                          name: "custrecord_da_earnings_amount",
                                          label: "Amount"
                                      })
                                  ]
                              });
                              var searchResultCount = earningsSearch.runPaged().count;
                              log.debug("Earnings count", searchResultCount);
                              earningsSearch.run().each(function(result){
      var earningType = result.getText('custrecord_da_earnings_payroll_item');
       var amount = result.getValue( 'custrecord_da_earnings_amount');
       log.debug('earningType',earningType);
//search on deductions
       var deductionsSearch = search.create({
                                  type: "customrecord_da_emp_deductions",
                                  filters: [
                                      ["custrecord_deduction_employee", "anyof",employeeId]
                                  ],
                                  columns: [
                                      search.createColumn({
                                          name: "custrecord_deduction_payroll_item",
                                          label: "Payroll Item"
                                      }),
                                      search.createColumn({
                                          name: "custrecord_deduction_payroll_amount",
                                          label: "Amount"
                                      })
                                  ]
                              });
                              var searchResultCount = deductionsSearch.runPaged().count;
                              log.debug("Deductions count", searchResultCount);
                              deductionsSearch.run().each(function(result){
      var deductionType = result.getText('custrecord_deduction_payroll_item');
       var amount1 = result.getValue( 'custrecord_deduction_payroll_amount');
       log.debug('deductionType',deductionType);
      xml+= '<tr>';
     xml+= '<td border-right="1px" border-bottom="1px" font-size="10pt"><b>'+earningType+'</b></td>'+
     '<th border-right="1px" border-bottom="1px" font-size="10pt" align="right">'+amount+'</th>';
     xml+= '<td border-right="1px" border-bottom="1px" font-size="10pt"><b>'+deductionType+'</b></td>'+
     '<th font-size="10pt" border-bottom="1px" align="right">'+amount1+'</th>';
     
      
   xml+='</tr>';
   return true;
   });
    return true;
  });
      xml+='<tr>'+
     '<td border-right="1px" border-bottom="1px" font-size="10pt"><b>Total</b></td>'+
     '<td border-right="1px" border-bottom="1px" font-size="10pt" align="right">900.000</td>'+
     '<td border-right="1px" border-bottom="1px" font-size="10pt"><b>Total</b></td>'+
     '<td font-size="10pt" border-bottom="1px" align="right">100.000</td>'+
   '</tr>'+
   '<tr>'+
   '<td colspan="4"></td>'+
   '</tr>'+
   '<tr>'+
   '<td colspan="4" font-size="12pt" padding-top="15px">NetPay:</td>'+
   '</tr>'+
   '<tr>'+
   '<td colspan="4" font-size="12pt" height="50px" border-bottom="1px">In Words:</td>'+
   '</tr>'+
   '<tr>'+
   '<td colspan="4" font-size="12pt"  align="center" padding-top="15px">NAME</td>'+
   '</tr>'+
   '<tr>'+
   '<td colspan="4" font-size="12pt" height="50px" align="center" border-bottom="1px">Authorized Signatory:</td>'+
   '</tr>'+
   '<tr>'+
   '<td colspan="4" font-size="12pt" height="15px" align="center" >Note : This is computer generated Payslip and does not require any signature.</td>'+
   '</tr>'+
    '</table>';
                xml += '</body></pdf>';
                    xml = xml.replace(/\&/g, "&amp;");
                    var pdfFile = render.xmlToPdf({
                        xmlString: xml
                    });

                    var renderer = render.create();
                    renderer.templateContent = xml;
              
                renderer.addRecord('record', payslipRec);

                    var statementPdf = renderer.renderAsPdf();




                    response.writeFile(statementPdf,true);
                    //var fileId = fileObj.save();
                    //log.debug('fileId',fileId);
                    //response.writeFile(fileObj);
                }
              

              //context.response.writePage(form);



            } catch (ex) {
                log.error(ex.name, ex.message);
            }
        }
  
  function getPostingPeriodId(month, year) {
            var monthsobj = {
                '1': 'Jan',
                '2': 'Feb',
                '3': 'Mar',
                '4': 'Apr',
                '5': 'May',
                '6': 'Jun',
                '7': 'Jul',
                '8': 'Aug',
                '9': 'Sep',
                '10': 'Oct',
                '11': 'Nov',
                '12': 'Dec'
            }
            var postingperiodMonth = monthsobj[month];
            if (month == 0 || month == "0") {
                year = year - 1;
                postingperiodMonth = "Dec";
            }
            log.debug('postingperiodMonth', postingperiodMonth + " " + year);
            var accountingperiodSearchObj = search.create({
                type: "accountingperiod",
                filters: [
                    ["periodname", "startswith", postingperiodMonth + " " + year]
                ],
                columns: [
                    search.createColumn({
                        name: "periodname",
                        sort: search.Sort.ASC,
                        label: "Name"
                    })
                ]
            });
            var searchResultCount = accountingperiodSearchObj.runPaged().count;
            //log.debug("accountingperiodSearchObj result count",searchResultCount);
            var postingPeriodId;
            accountingperiodSearchObj.run().each(function(result) {
                postingPeriodId = result.id;
                return true;
            });
            log.debug('postingPeriodId', postingPeriodId);
            return postingPeriodId;
        }
function convertNumberToWords(s) {
    var th = ['','Thousand','Million', 'Billion','Trillion'];
    var dg = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    var tn = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    var tw = ['Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    s = s.toString();
    s = s.replace(/[\, ]/g,'');
    if (s != parseFloat(s)) return 'not a number';
    var x = s.indexOf('.');
    if (x == -1)
      x = s.length;
    if (x > 15)
      return 'too big';
    var n = s.split(''); 
    var str = '';
    var sk = 0;
    for (var i=0;   i < x;  i++) {
      if ((x-i)%3==2) { 
        if (n[i] == '1') {
          str += tn[Number(n[i+1])] + ' ';
          i++;
          sk=1;
        } else if (n[i]!=0) {
          str += tw[n[i]-2] + ' ';
          sk=1;
        }
      } else if (n[i]!=0) { // 0235
        str += dg[n[i]] +' ';
        if ((x-i)%3==0) str += 'hundred ';
        sk=1;
      }
      if ((x-i)%3==1) {
        if (sk)
          str += th[(x-i-1)/3] + ' ';
        sk=0;
      }
    }

    if (x != s.length) {
      var y = s.length;
      str += 'point ';
      for (var i=x+1; i<y; i++)
        str += dg[n[i]] +' ';
    }
    return str.replace(/\s+/g,' ');
  }

       
        return {
            onRequest: onRequest
        };
    });
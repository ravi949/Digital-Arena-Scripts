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
                   
                    var objRec = record.load({
                    type : 'customrecord_da_abc_grades',
                   id :params.id
                  });
                    
              ///search on sales order
                    var xml = '<?xml version=\"1.0\"?><pdf><head><macrolist>'+
    '<macro id=\"nlheader\"><table class=\"header\" style=\"width: 100%;\"><tr> <td><barcode codetype="qrcode" showtext="true" value=" " width="70px" height="70px" /></td> </tr></table></macro></macrolist>'+
    '<style type=\"text/css\">table { font-size: 9pt; table-layout: fixed; } th { font-weight: bold; font-size: 8pt; vertical-align: middle; padding: 5px 6px 3px; background-color: #e3e3e3; color: #333333; } td { padding: 4px 6px;font-size:10pt; } td p { align:left }table.header td { padding: 0; font-size: 10pt; } table.footer td { padding: 0; font-size: 8pt; } table.itemtable th { padding-bottom: 10px; padding-top: 10px; } table.body td { padding-top: 2px;font-size:10pt; } td.addressheader { font-weight: bold; font-size: 8pt; padding-top: 6px; padding-bottom: 2px; } td.address { padding-top: 0; } span.title { font-size: 28pt; } span.number { font-size: 16pt; } div.remittanceSlip { width: 100%; height: 200pt; page-break-inside: avoid; page-break-after: avoid; } hr { border-top: 1px dashed #d3d3d3; width: 100%; color: #ffffff; background-color: #ffffff; height: 1px; } input.largerCheckbox {width: 70px; height: 15px; } </style> </head>'+
     '<body header=\"nlheader\" header-height=\"12%\" footer=\"nlfooter\" footer-height=\"5%\" padding=\"0.1in 0.5in 0.2in 0.5in\" size=\"A4\">'+
                        '<br />';
    
         xml += ' <table style="width:100%;margin-top:15px"><tr><td><p align="center" font-size="23px"><b>ABC Grade Setting</b></p></td></tr></table>';
         xml += ' <table style="width:100%;margin-top:15px"><tr><td><p align="right" font-size="12px"></p></td></tr></table>';
         
         xml += ' <table style="width:100%;margin-top:25px"><tr><td><p align="left" font-size="15px">Subsidiary:</p></td></tr></table>';
          xml += ' <table style="width:100%;margin-top:25px"><tr><td><p  font-size="15px">Class:</p></td></tr></table>';

                xml += '</body></pdf>';
                    xml = xml.replace(/\&/g, "&amp;");
                    var pdfFile = render.xmlToPdf({
                        xmlString: xml
                    });
                    var renderer = render.create();
                    renderer.templateContent = xml;
                renderer.addRecord('record', objRec);
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
       
        return {
            onRequest: onRequest
        };
    });
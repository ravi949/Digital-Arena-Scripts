/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope TargetAccount
 */
define(['N/render', 'N/record', 'N/file', 'N/search', 'N/format'],

    function(render, record, file, search, format) {

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
                log.debug('params', params);
                var myTemplate = render.create();
               
                var itemReceiptRec = record.load({
                    type: 'itemreceipt',
                    id: params.recordId
                });
              var customForm = itemReceiptRec.getValue('customform');
              
              if(customForm == 105){
                  myTemplate.setTemplateByScriptId({
                    scriptId: "CUSTTMPL_159_5740514_431"
                });
                 
                 }else{
                 myTemplate.setTemplateByScriptId({
                    scriptId: "CUSTTMPL_ITEM_RECEIPT_SCRIPT"
                });
              }
                log.debug('customForm', customForm);
                myTemplate.addRecord('record', itemReceiptRec);


                var createdFrom = itemReceiptRec.getValue('createdfrom'), type;
                if (createdFrom) {
                    var fieldLookUp = search.lookupFields({
                        type: 'transaction',
                        id: createdFrom,
                        columns: ['type']
                    });
                    log.debug('fieldLookUp ', fieldLookUp.type[0].value);
                    type = fieldLookUp.type[0].value;
                }

                /*var fieldLookUp = search.lookupFields({
                	type: 'vendor',
                	id: itemReceiptRec.getValue('entity'),
                	columns: ['address']
                });

                log.debug('fieldLookUp',fieldLookUp.address);*/

                var subsidiaryId = itemReceiptRec.getValue('subsidiary');

                var subsidiaryRecord = record.load({
                    type: 'subsidiary',
                    id: subsidiaryId
                })
                log.debug('fieldLookUp', subsidiaryRecord.getValue('logo'));

                var logourl = "";
                if (subsidiaryRecord.getValue('logo')) {
                    var fieldLookUpForUrl = search.lookupFields({
                        type: 'file',
                        id: subsidiaryRecord.getValue('logo'),
                        columns: ['url']
                    });
                    log.debug('fieldLookUpurl', fieldLookUpForUrl.url);
                    logourl = params.urlorigin + "" + fieldLookUpForUrl.url;
                }


                log.debug('add', subsidiaryRecord.getValue('mainaddress_text'));

                var numLines = itemReceiptRec.getLineCount({
                    sublistId: 'item'
                });
              var totalAmount = 0;
                var quantity = 0,
                    rate = 0,
                    landedcost = 0,tolocation = "";
                for (var i = 0; i < numLines; i++) {
                    var itemQuantity = itemReceiptRec.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'quantity',
                        line: i
                    });
                    tolocation = itemReceiptRec.getSublistText({
                        sublistId: 'item',
                        fieldId: 'location',
                        line: i
                    });
                    quantity = parseFloat(quantity) + parseFloat(itemQuantity);

                    var itemRate = itemReceiptRec.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'rate',
                        line: i
                    });

                  //  rate = parseFloat(rate) + parseFloat(itemRate);
                  var value = itemRate * itemQuantity ;
                  log.debug('details', value +"rate" + rate + "quantity" + quantity);
                  totalAmount = parseFloat(value) + parseFloat(totalAmount);

                    var itemLandedCost = itemReceiptRec.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'landedcost',
                        line: i
                    });
                    log.debug('itemLandedCost', itemLandedCost);

                    landedcost = parseFloat(landedcost) + parseFloat(itemLandedCost);

                }

                log.debug('values', quantity + '' + landedcost + '' + rate);
              log.debug('totalAmount',totalAmount);

                var date = new Date(); //Mon Aug 24 2015 17:27:16 GMT-0700 (Pacific Daylight Time)
                var kuwait = format.format({
                    value: date,
                    type: format.Type.DATETIME,
                    timezone: format.Timezone.ASIA_RIYADH
                });

                //			var glImpactObj = [];

                var logourl = logourl.split('&');
                log.debug('logourl', logourl);
                //log.debug('glImpactObjvv',glImpactObj.line1.account);

                var objj = {
                    //					"subsidiary":glImpactObj[0].subsidiary,
                    //					"account":glImpactObj[0].account,
                    //					"amountdebit":glImpactObj[0].amountdebit,
                    //					"amountcredit":glImpactObj[0].amountcredit,
                    //					"memo":glImpactObj[0].memo,							
                    //					"account1":glImpactObj[1].account,
                    //					"amountdebit1":glImpactObj[1].amountdebit,
                    //					"amountcredit1":glImpactObj[1].amountcredit,
                    //					"memo1":glImpactObj[1].memo,
                    //"supplieraddress":fieldLookUp.address,
                    "img_logo1": logourl[0],
                    "img_logo2": logourl[1],
                    "img_logo3": logourl[2],
                    //"subaddress":subsidiaryRecord.getValue('mainaddress_text'),
                    "totalqty": (quantity) ? (quantity) : '0',
                    "totalAmount": (totalAmount) ? (totalAmount) : '0',
                    "totallc": (landedcost) ? (landedcost) : '0',
                    "date": kuwait,
                    "type":type,
                    "tolocation":tolocation
                }

                //log.debug('glImpactObj',glImpactObj);
                log.debug('objj', objj);
                log.debug('myTemplate', myTemplate);

                myTemplate.addCustomDataSource({
                    format: render.DataSource.OBJECT,
                    alias: "objj",
                    data: objj
                });

                var template = myTemplate.renderAsPdf();
                log.debug('template', template);
                context.response.writeFile(template, true);

            } catch (ex) {
                log.error(ex.name, ex.message);
            }

        }



        return {
            onRequest: onRequest
        };

    });
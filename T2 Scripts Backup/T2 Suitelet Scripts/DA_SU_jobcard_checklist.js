/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope TargetAccount
 */
define(['N/render', 'N/record', 'N/file', 'N/search'],
    function(render, record, file, search) {
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
                
                myTemplate.setTemplateByScriptId({
                        scriptId: "CUSTTMPL_DA_B2B_CHECKLIST_TEMPLATE"
                });
                
                var jobOrderRec = record.load({
                    type: 'customrecord_da_job_cards',
                    id: params.recordId
                });
                myTemplate.addRecord('record', jobOrderRec);
                log.debug('jobOrderRec', jobOrderRec);
                var classId = jobOrderRec.getValue('custrecord_da_btob_business_unit');
                var logourl = "";
                var classRecord = record.load({
                    type: 'classification',
                    id: classId
                })
                log.debug('fieldLookUp', classRecord.getValue('logo'));
                var logourl = "";
                if (classRecord.getValue('custrecord_da_class_image')) {
                    var fieldLookUpForUrl = search.lookupFields({
                        type: 'file',
                        id: classRecord.getValue('custrecord_da_class_image'),
                        columns: ['url']
                    });
                    log.debug('fieldLookUpurl', fieldLookUpForUrl.url);
                    logourl = params.urlorigin + "" + fieldLookUpForUrl.url;
                }
                log.debug('logourl', logourl);
                logourl = logourl.split('&');
                log.debug('logourl', logourl);
                var firstlinesObj = {};
                var firstLinesArr = [];
                var linesObj = {};
                var i = 1;
                var customrecord_da_btob_items_to_be_serviceSearchObj = search.create({
                   type: "customrecord_da_btob_items_to_be_service",
                   filters:
                   [
                      ["custrecord_da_btob_parent1","anyof",params.recordId]
                   ],
                   columns:
                   [
                      search.createColumn({
                         name: "scriptid",
                         sort: search.Sort.ASC,
                         label: "Script ID"
                      }),
                      search.createColumn({name: "custrecord_da_btob_parent1", label: "Parent"}),
                      search.createColumn({name: "custrecord_da_btob_item", label: "Item"}),
                      search.createColumn({name: "custrecord_da_btob_item_description", label: "Item Description"}),
                      search.createColumn({name: "custrecord_da_btob_item_model", label: "Item Model"}),
                      search.createColumn({name: "custrecord_da_btob_color", label: "Color"}),
                      search.createColumn({name: "custrecord_da_btob_serial_no", label: "Serial No"}),
                      search.createColumn({name: "custrecord_da_btob_invoice_date", label: "Invoice Date"}),
                      search.createColumn({name: "custrecord_da_btob_warranty", label: "Is It Under Warranty?"}),
                      search.createColumn({name: "custrecord_da_items_to_be_serv_comments", label: "Comments"}),
                      search.createColumn({name: "custrecord_da_commission_and_train", label: "Commissioning & Training"}),
                      search.createColumn({name: "custrecord_da_googs_remove_from_site", label: "Goods Removal From Site"}),
                      search.createColumn({name: "custrecord_da_instal_or_assemble", label: "Installation / Assemblage"}),
                      search.createColumn({name: "custrecord_da_maintenance_repair", label: "Maintenance & Repair Services"}),
                      search.createColumn({name: "custrecord_da_services_completed", label: "Services Completed"}),
                      search.createColumn({name: "custrecord_da_site_survey", label: "Site Survey(Pre-Installation)"}),
                      search.createColumn({name: "custrecord_da_aj_service_check_list", label: "Warranty"})
                   ]
                });
                var searchResultCount = customrecord_da_btob_items_to_be_serviceSearchObj.runPaged().count;
                log.debug("customrecord_da_btob_items_to_be_serviceSearchObj result count",searchResultCount);
               
                customrecord_da_btob_items_to_be_serviceSearchObj.run().each(function(result){
                   var item = result.getText('custrecord_da_btob_item');
                   var description = result.getValue('custrecord_da_btob_item_description');
                   var model = result.getValue('custrecord_da_btob_item_model');
                   var colour = result.getValue('custrecord_da_btob_color');
                   var underwarranty = result.getValue('custrecord_da_btob_warranty');
                   var jobtype = '';
                   var comments = result.getText('custrecord_da_items_to_be_serv_comments');
                   var matched = item.match('&');
                    if (matched) {
                        item = item.replace(/&/g, "&amp;");
                    }
                    var matched1 = description.match('&');
                    if (matched1) {
                        description = description.replace(/&/g, "&amp;");
                    }
                  var sc =  result.getText('custrecord_da_aj_service_check_list');
                              var scmatched = item.match('&');          
 if (scmatched) {
                        sc = sc.replace(/&/g, "&amp;");
                    }
                    firstLinesArr.push({
                        'sno': i,
                        'item': item,
                        'description': description,
                        "model": model,
                        'colour': colour,
                        'underwarranty' : underwarranty,
                        'jobtype' : jobtype,
                        'comments' : comments,
                        'sc':sc
                    });
                    i++;
                   return true;
                });
                var amount = 0;
                 var i =1;
                var linesArr = [];
                var customrecord_da_btob_required_servicsSearchObj = search.create({
                   type: "customrecord_da_btob_required_servics",
                   filters:
                   [
                      ["custrecord_da_btob_parent2","anyof",params.recordId]
                   ],
                   columns:
                   [                      
                      search.createColumn({name: "custrecord_da_btob_parent2", label: "Parent"}),
                      search.createColumn({name: "custrecord_da_btob_service", label: "Service/Item"}),
                      search.createColumn({name: "custrecord_da_btob_decription", label: "Description"}),
                      search.createColumn({name: "custrecord_da_btob_quantity", label: "Quantity"}),
                      search.createColumn({name: "custrecord_da_btob_unit_price", label: "Unit Price"}),
                      search.createColumn({name: "custrecord_da_btob_total", label: "Total"}),
                      search.createColumn({name: "custrecord_da_btob_item_type", label: "Item Type"}),
                      search.createColumn({name: "custrecord_da_btob_warranty2", label: "Is It Warranty?"}),
                      search.createColumn({name: "custrecord_da_btob_parts_issued", label: "Parts Issued?"})
                   ]
                });
                var searchResultCount = customrecord_da_btob_required_servicsSearchObj.runPaged().count;
                log.debug("customrecord_da_btob_required_servicsSearchObj result count",searchResultCount);
                
                customrecord_da_btob_required_servicsSearchObj.run().each(function(result) {
                    var product = result.getText('custrecord_da_btob_service');
                    var description = result.getValue('custrecord_da_btob_decription');
                    var qty = result.getValue('custrecord_da_btob_quantity');
                    var unitrate = result.getValue('custrecord_da_btob_unit_price');
                    var total = result.getValue('custrecord_da_btob_total');
                    var isVendorApproved = result.getValue("custrecord_da_btob_warranty2");
                    if (isVendorApproved) {
                        total = 0;
                    }
                    var matched = product.match('&');
                    if (matched) {
                        product = product.replace(/&/g, "&amp;");
                    }
                    var matched1 = description.match('&');
                    if (matched1) {
                        description = description.replace(/&/g, "&amp;");
                    }
                    amount = parseFloat(total) + parseFloat(amount);
                    linesArr.push({
                        'sno': i,
                        'qty': qty,
                        'description': description,
                        "unitrate": unitrate,
                        'total': total
                    });
                    i++;
                    return true;
                });
                var linesObj = {
                    'linesArr': linesArr
                };
                var firstlinesObj = {
                    'firstlinesArr': firstLinesArr
                };
                log.debug('linesObj', linesObj);
                var objj = {
                    'total': addZeroes(amount.toString()),
                    "img_logo1": logourl[0],
                    "img_logo2": logourl[1],
                    "img_logo3": logourl[2]
                };
               log.debug('objj', objj);
                myTemplate.addCustomDataSource({
                    format: render.DataSource.OBJECT,
                    alias: "objj",
                    data: objj
                });
                myTemplate.addCustomDataSource({
                    format: render.DataSource.OBJECT,
                    alias: "linesObj",
                    data: linesObj
                });
                myTemplate.addCustomDataSource({
                    format: render.DataSource.OBJECT,
                    alias: "firstlinesObj",
                    data: firstlinesObj
                });
			
			
              
              var template = myTemplate.renderAsPdf();
                log.debug('template', template);
                context.response.writeFile(template, true);
            } catch (ex) {
                log.error(ex.name, ex.message);
            }
        }

        function addZeroes(num) {
            var value = Number(num);
            var res = num.split(".");
            if (res.length == 1 || (res[1].length < 3)) {
                value = value.toFixed(2);
            }
            return value
        }
        return {
            onRequest: onRequest
        };
    });
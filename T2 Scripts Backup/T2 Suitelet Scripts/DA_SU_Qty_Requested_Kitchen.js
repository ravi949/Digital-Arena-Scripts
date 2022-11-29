/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope TargetAccount
 */
define(['N/ui/serverWidget', 'N/search', 'N/format', 'N/encode', 'N/file', 'N/record', 'N/redirect', 'N/url'],
    function(ui, search, format, encode, file, record, redirect, url) {
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
                        title: 'Qty To Be Requested Kitchen'
                    });
                    form.addSubmitButton({
                        label: 'Replenish'
                    });
                    var startDateField = form.addField({
                        id: 'custpage_start_date',
                        type: ui.FieldType.DATE,
                        label: 'From Date'
                    });
                    startDateField.updateDisplaySize({
                        height: 250,
                        width: 440
                    });
                    var endDateField = form.addField({
                        id: 'custpage_end_date',
                        type: ui.FieldType.DATE,
                        label: 'To Date'
                    }).updateBreakType({
                        breakType: ui.FieldBreakType.STARTCOL
                    });
                    endDateField.updateDisplaySize({
                        height: 250,
                        width: 440
                    });
                    var workOrderField = form.addField({
                        id: 'custpage_workorder',
                        type: ui.FieldType.TEXT,
                        label: 'Document No',
                    }).updateBreakType({
                        breakType: ui.FieldBreakType.STARTCOL
                    });
                    var location = form.addField({
                        id: 'custpage_location',
                        type: ui.FieldType.SELECT,
                        source: 'customrecord_da_prod_plan_settings',
                        label: 'Select Location'
                    }).updateBreakType({
                        breakType: ui.FieldBreakType.STARTCOL
                    });
                    var tab = form.addSubtab({
                        id: 'custpage_tab',
                        label: 'Replenishment'
                    });
                    var dateField = form.addField({
                        id: 'custpage_date',
                        type: ui.FieldType.DATE,
                        label: 'Date',
                        container: 'custpage_tab'
                    });
                    dateField.updateDisplaySize({
                        height: 250,
                        width: 440
                    });
                    var fromLocation = form.addField({
                        id: 'custpage_from_location',
                        type: ui.FieldType.SELECT,
                        label: 'From Location',
                        source: 'location',
                        container: 'custpage_tab'
                    });
                    var locationField = form.addField({
                        id: 'custpage_location_field',
                        type: ui.FieldType.SELECT,
                        label: 'Location',
                        source: 'location',
                        container: 'custpage_tab'
                    }).updateBreakType({
                        breakType: ui.FieldBreakType.STARTCOL
                    });
                    var toLocation = form.addField({
                        id: 'custpage_to_location',
                        type: ui.FieldType.SELECT,
                        label: 'To Location',
                        source: 'location',
                        container: 'custpage_tab'
                    });
                    var subsidiaryField = form.addField({
                        id: 'custpage_subsidiary',
                        type: ui.FieldType.SELECT,
                        label: 'Subsidiary',
                        source: 'subsidiary',
                        container: 'custpage_tab'
                    }).updateBreakType({
                        breakType: ui.FieldBreakType.STARTCOL
                    });
                    var vendorField = form.addField({
                        id: 'custpage_vendor',
                        type: ui.FieldType.SELECT,
                        label: 'Vendor',
                        source: 'vendor',
                        container: 'custpage_tab'
                    });
                    var isInternalTransferField = form.addField({
                        id: 'custpage_is_internal_transfer',
                        type: ui.FieldType.CHECKBOX,
                        label: 'Is Internal Transfer',
                        container: 'custpage_tab'
                    }).updateBreakType({
                        breakType: ui.FieldBreakType.STARTCOL
                    });

                    var currencyField = form.addField({
                        id: 'custpage_currency',
                        type: ui.FieldType.SELECT,
                        label: 'Currency',
                        source: 'currency',
                        container: 'custpage_tab'
                    });
                    var reportList = form.addSublist({
                        id: 'custpage_report_sublist',
                        type: ui.SublistType.LIST,
                        label: 'Report',
                        tab: 'custpage_tab'
                    });
                    var replenishField = reportList.addField({
                        id: 'custpage_replenish',
                        type: ui.FieldType.CHECKBOX,
                        label: 'Replenish'
                    });
                    var itemIdField = reportList.addField({
                        id: 'custpage_item_id',
                        type: ui.FieldType.TEXT,
                        label: 'Item Id'
                    });
                    itemIdField.updateDisplayType({
                        displayType: ui.FieldDisplayType.HIDDEN
                    });
                    var Name = reportList.addField({
                        id: 'custpage_display_name',
                        type: ui.FieldType.TEXT,
                        label: 'Display Name'
                    });
                    Name.updateDisplaySize({
                        height: 60,
                        width: 50
                    });
                    reportList.addField({
                        id: 'custpage_workorder_qty',
                        type: ui.FieldType.FLOAT,
                        label: 'Sum Of Qty Of Workorder'
                    });
                    var unitsField = reportList.addField({
                        id: 'custpage_tran_units',
                        type: ui.FieldType.TEXT,
                        label: 'Units'
                    });
                    unitsField.updateDisplayType({
                        displayType: ui.FieldDisplayType.HIDDEN
                    });
                    reportList.addField({
                        id: 'custpage_units',
                        type: ui.FieldType.TEXT,
                        label: 'Units'
                    });
                    reportList.addField({
                        id: 'custpage_qty_avail_kitchen',
                        type: ui.FieldType.FLOAT,
                        label: 'Maximum Of Qty Available in Kitchen'
                    });
                    reportList.addField({
                        id: 'custpage_qty_req_kitchen',
                        type: ui.FieldType.FLOAT,
                        label: 'Qty to be Requested For Kitchen'
                    });
                    var workOrderNo;
                    var locationNo;
                     var formattedDateVal;
                    var formattedStartDate;
                    var formattedEndDate;
                    if (request.parameters.vendorVal) {
                        vendorField.defaultValue = request.parameters.vendorVal;
                        log.debug('vendorVal', request.parameters.vendorVal);
                    }
                    if (request.parameters.currencyVal) {
                        currencyField.defaultValue = request.parameters.currencyVal;
                        log.debug('currencyVal', request.parameters.currencyVal);
                    }
                    if (request.parameters.subsidiaryVal) {
                        subsidiaryField.defaultValue = request.parameters.subsidiaryVal;
                        log.debug('subsidiaryVal', request.parameters.subsidiaryVal);
                    }
                    if (request.parameters.toLocVal) {
                        toLocation.defaultValue = request.parameters.toLocVal;
                        log.debug('toLocVal', request.parameters.toLocVal);
                    }
                    if (request.parameters.fromLocVal) {
                        fromLocation.defaultValue = request.parameters.fromLocVal;
                        log.debug('fromLocVal', request.parameters.fromLocVal);
                    }
                      // var dateValue = request.parameters.dateValText;
                    if (request.parameters.dateVal) {
                        var dateFieldVal = (request.parameters.dateVal);
                        //dateFieldVal.setDate(dateFieldVal.getDate() + 1);
                        //dateField.defaultValue = dateFieldVal;
                        //log.debug('dateFieldVal', dateFieldVal);
                      formattedDateVal = format.parse({
                            value: dateFieldVal,
                            type: format.Type.DATE
                        });
                        log.debug('formattedDateVal', formattedDateVal);
                      dateField.defaultValue = formattedDateVal;
                    }
                    var iTValue = request.parameters.custpage_is_internal_transfer;
                    log.debug('iTValue', iTValue);
                    if (!iTValue) {
                        log.debug('Empty');
                        isInternalTransferField.defaultValue = "F";
                        fromLocation.isMandatory = false;
                        toLocation.isMandatory = false;
                        fromLocation.isMandatory = false;
                        fromLocation.updateDisplayType({
                            displayType: ui.FieldDisplayType.DISABLED
                        });
                        toLocation.isMandatory = false;
                        toLocation.updateDisplayType({
                            displayType: ui.FieldDisplayType.DISABLED
                        });
                        vendorField.isMandatory = true;
                        vendorField.updateDisplayType({
                            displayType: ui.FieldDisplayType.NORMAL
                        });
                        currencyField.isMandatory = true;
                        currencyField.updateDisplayType({
                            displayType: ui.FieldDisplayType.NORMAL
                        });
                    }

                    if (request.parameters.internalTransfer) {
                        var internalTransferVal = request.parameters.internalTransfer;
                        log.debug('internalTransferVal', internalTransferVal);

                        if (internalTransferVal == 'true') {
                            log.debug('true');
                            isInternalTransferField.defaultValue = "T";
                            vendorField.isMandatory = false;
                            currencyField.isMandatory = false;
                            vendorField.isMandatory = false;
                            vendorField.updateDisplayType({
                                displayType: ui.FieldDisplayType.DISABLED
                            });
                            currencyField.isMandatory = false;
                            currencyField.updateDisplayType({
                                displayType: ui.FieldDisplayType.DISABLED
                            });
                            fromLocation.isMandatory = true;
                            fromLocation.updateDisplayType({
                                displayType: ui.FieldDisplayType.NORMAL
                            });
                            toLocation.isMandatory = true;
                            toLocation.updateDisplayType({
                                displayType: ui.FieldDisplayType.NORMAL
                            });
                        }
                        if (internalTransferVal == 'false') {
                            log.debug('false');
                            isInternalTransferField.defaultValue = "F";
                            fromLocation.isMandatory = false;
                            toLocation.isMandatory = false;
                            fromLocation.isMandatory = false;
                            fromLocation.updateDisplayType({
                                displayType: ui.FieldDisplayType.DISABLED
                            });
                            toLocation.isMandatory = false;
                            toLocation.updateDisplayType({
                                displayType: ui.FieldDisplayType.DISABLED
                            });
                            vendorField.isMandatory = true;
                            vendorField.updateDisplayType({
                                displayType: ui.FieldDisplayType.NORMAL
                            });
                            currencyField.isMandatory = true;
                            currencyField.updateDisplayType({
                                displayType: ui.FieldDisplayType.NORMAL
                            });
                        }
                    }
                    if (request.parameters.workOrderId) {
                        workOrderField.defaultValue = request.parameters.workOrderId;
                        workOrderNo = request.parameters.workOrderId;
                        log.debug('workOrderNo', workOrderNo);

                    }
                    log.debug('locationNo', locationNo);
                   var startDate = (request.parameters.startDateText);
                      var endDate = (request.parameters.endDateText);
                    if (request.parameters.startDate) {
                        var startTomorrow = new Date(request.parameters.startDate);
                        //startTomorrow.setDate(startTomorrow.getDate() + 1);
                        //startDateField.defaultValue = startTomorrow;
                        //var startDateVal = startTomorrow;
                        //log.debug('startDateVal', startDateVal);
                        formattedStartDate = format.parse({
                            value: startDate,
                            type: format.Type.DATE
                        });
                        log.debug('formattedStartDate', formattedStartDate);
                      startDateField.defaultValue = formattedStartDate;
                    }
                    if (request.parameters.endDate) {
                        var endTomorrow = new Date(request.parameters.endDate);
                        //endTomorrow.setDate(endTomorrow.getDate() + 1);
                        //endDateField.defaultValue = endTomorrow;
                        //var endDateVal = endTomorrow;
                        //log.debug('endDateVal', endDateVal);
                        formattedEndDate = format.parse({
                            value: endDate,
                            type: format.Type.DATE
                        });
                        log.debug('formattedEndDate', formattedEndDate);
                      endDateField.defaultValue = formattedEndDate;
                    }

                    if (request.parameters.locationVal) {
                        locationField.defaultValue = request.parameters.locationVal;
                        log.debug('locationVal', request.parameters.locationVal);

                    }

                    if (request.parameters.locationId) {

                        location.defaultValue = request.parameters.locationId;
                        locationNo = request.parameters.locationId;
                        var rec = record.load({
                            type: 'customrecord_da_prod_plan_settings',
                            id: request.parameters.locationId
                        });
                        var locationText = rec.getText('custrecord_da_prod_replenish_location');
                        log.debug('locationText', locationText);


                        var itemSearchObj = search.create({
                            type: "item",
                            filters: [
                                ["transaction.type", "anyof", "WorkOrd"],
                                "AND",
                                ["transaction.mainline", "is", "F"],
                                "AND",
                                ["transaction.status", "anyof", "WorkOrd:D", "WorkOrd:B"],
                                "AND",
                                ["formulanumeric: CASE WHEN {inventorylocation} LIKE '" + locationText + "' THEN {locationquantityavailable} WHEN {transaction.quantity} >0 THEN{locationquantityavailable}- {transaction.quantity} ELSE 0 END ", "greaterthan", "0"],
                                "AND",
                                ["formulanumeric: CASE WHEN {inventorylocation} LIKE '" + locationText + "' THEN {locationquantityavailable} ELSE 0 END", "greaterthan", "0"]
                            ],
                            columns: [
                                search.createColumn({
                                    name: "internalid",
                                    summary: "GROUP",
                                    label: "Internal Id"
                                }),
                                search.createColumn({
                                    name: "displayname",
                                    summary: "GROUP",
                                    label: "Display Name"
                                }),
                                search.createColumn({
                                    name: "quantity",
                                    join: "transaction",
                                    summary: "SUM",
                                    label: "Quantity"
                                }),
                                search.createColumn({
                                    name: "unit",
                                    join: "transaction",
                                    summary: "GROUP",
                                    label: "Units"
                                }),
                                search.createColumn({
                                    name: "formulanumeric1",
                                    summary: "MAX",
                                    formula: "CASE WHEN {inventorylocation} LIKE '" + locationText + "' THEN {locationquantityavailable} ELSE 0 END",
                                    label: "Formula (Numeric)"
                                }),
                                search.createColumn({
                                    name: "formulanumeric2",
                                    summary: "MIN",
                                    formula: "ABS(CASE WHEN {inventorylocation} LIKE '" + locationText + "' AND ({locationquantityavailable}<{transaction.quantity})THEN ({locationquantityavailable}-{transaction.quantity}) ELSE 0 END)",
                                    label: "QTY to be Requested for Kitchen"
                                })
                            ]
                        });
                        var searchResultCount = itemSearchObj.runPaged().count;
                        log.debug("itemSearchObj result count", searchResultCount);
                        if (startDate && endDate) {
                            log.debug('formattedStartDateVal', formattedStartDate);
                            log.debug('formattedEndDateVal', formattedEndDate);
                            itemSearchObj.filters.push(search.createFilter({
                                name: 'trandate',
                                join: "transaction",
                                operator: 'within',
                                values: [startDate, endDate]
                            }));

                        }
                        if (request.parameters.workOrderId) {
                            var workOrderIdVal = request.parameters.workOrderId;
                            log.debug('workOrderIdVal', workOrderIdVal);
                            var workOrderIdValues = itemSearchObj.filters.push(search.createFilter({
                                name: 'number',
                                join: "transaction",
                                operator: 'contains',
                                values: workOrderIdVal
                            }));
                            log.debug('workOrderIdValues', workOrderIdValues);
                        }
                     /*   if (request.parameters.locationId) {
                            var locationIdVal = request.parameters.locationId;
                            log.debug('locationIdVal', locationIdVal);
                            itemSearchObj.filters.push(search.createFilter({
                                name: 'location',
                                join: "transaction",
                                operator: 'anyof',
                                values: locationIdVal
                            }));
                        }*/
                        var searchResultCount = itemSearchObj.runPaged().count;
                        log.debug("itemSearchObj result count", searchResultCount);
                        var i = 0;
                        itemSearchObj.run().each(function(result) {
                            var internalId = result.getValue({
                                "name": "internalid",
                                "summary": search.Summary.GROUP
                            });
                            log.debug("internalId", internalId);
                            var displayName = result.getValue({
                                "name": "displayname",
                                "summary": search.Summary.GROUP
                            });
                            log.debug("displayName", displayName);
                            var tranQty = result.getValue({
                                "name": "quantity",
                                "join": "transaction",
                                "summary": search.Summary.SUM
                            });
                            log.debug("tranQty", tranQty);
                            var tranUnits = result.getValue({
                                "name": "unit",
                                "join": "transaction",
                                "summary": search.Summary.GROUP
                            });
                            log.debug("tranUnits", tranUnits);
                            var tranUnit = result.getText({
                                "name": "unit",
                                "join": "transaction",
                                "summary": search.Summary.GROUP
                            });
                            log.debug("tranUnit", tranUnit);
                            var formulaNumeric1 = result.getValue({
                                "name": "formulanumeric1",
                                "summary": search.Summary.MAX
                            });
                            log.debug("formulaNumeric1", formulaNumeric1);
                            var formulaNumeric2 = result.getValue({
                                "name": "formulanumeric2",
                                "summary": search.Summary.MIN
                            });
                            log.debug("formulaNumeric2", formulaNumeric2);

                            if (internalId) {
                                reportList.setSublistValue({
                                    id: 'custpage_item_id',
                                    line: i,
                                    value: internalId
                                });
                            }
                            if (displayName) {
                                reportList.setSublistValue({
                                    id: 'custpage_display_name',
                                    line: i,
                                    value: displayName
                                });
                            }
                            if (tranQty) {
                                reportList.setSublistValue({
                                    id: 'custpage_workorder_qty',
                                    line: i,
                                    value: tranQty
                                });
                            }
                            if (tranUnits) {
                                reportList.setSublistValue({
                                    id: 'custpage_tran_units',
                                    line: i,
                                    value: tranUnits
                                });
                            }
                            if (tranUnit) {
                                reportList.setSublistValue({
                                    id: 'custpage_units',
                                    line: i,
                                    value: tranUnit
                                });
                            }
                            if (formulaNumeric1) {
                                reportList.setSublistValue({
                                    id: 'custpage_qty_avail_kitchen',
                                    line: i,
                                    value: formulaNumeric1
                                });
                            }
                            if (formulaNumeric2) {
                                reportList.setSublistValue({
                                    id: 'custpage_qty_req_kitchen',
                                    line: i,
                                    value: formulaNumeric2
                                });
                            }
                            i++;
                            return true;
                        });
                    }
                    context.response.writePage(form);
                    form.clientScriptModulePath = './DA_CS_Qty_Requested_Kitchen.js ';
                } else {
                    log.debug('else');
                    var internalTransferValue = request.parameters.custpage_is_internal_transfer;
                    log.debug('internalTransferValue', internalTransferValue);
                    var dateField = request.parameters.custpage_date;
                    log.debug('dateField', dateField);
                    if (dateField) {
                        var formattedDate = format.parse({
                            value: dateField,
                            type: format.Type.DATE
                        });
                        log.debug('formattedDate', formattedDate);
                    }
                    var subsidiaryId = request.parameters.custpage_subsidiary;
                    log.debug('subsidiaryId', subsidiaryId);
                    var locationValue = request.parameters.custpage_location;
                    log.debug('locationValue', locationValue);
                    if (internalTransferValue == 'T') {
                        var fromLocationId = request.parameters.custpage_from_location;
                        log.debug('fromLocationId', fromLocationId);
                        var toLocationId = request.parameters.custpage_to_location;
                        log.debug('toLocationId', toLocationId);
                        var transferOrderRec = record.create({
                            type: 'transferorder',
                            isDynamic: true
                        });
                        if (subsidiaryId) {
                            transferOrderRec.setValue('subsidiary', subsidiaryId);
                        }
                        if (dateField) {

                            transferOrderRec.setValue('trandate', formattedDate);
                        }
                        transferOrderRec.setValue('location', fromLocationId);
                        transferOrderRec.setValue('transferlocation', toLocationId);
                        var numLines = request.getLineCount({
                            group: 'custpage_report_sublist'
                        });
                        var checkBox, itemId, transUnits, itemQty;
                        for (var i = 0; i < numLines; i++) {
                            checkBox = request.getSublistValue({
                                group: 'custpage_report_sublist',
                                name: 'custpage_replenish',
                                line: i
                            });
                            log.debug('checkBox', checkBox);
                            if (checkBox == 'T') {
                                itemId = request.getSublistValue({
                                    group: 'custpage_report_sublist',
                                    name: 'custpage_item_id',
                                    line: i
                                });
                                log.debug('itemId', itemId);
                                transUnits = request.getSublistValue({
                                    group: 'custpage_report_sublist',
                                    name: 'custpage_tran_units',
                                    line: i
                                });
                                log.debug('transUnits', transUnits);
                                itemQty = request.getSublistValue({
                                    group: 'custpage_report_sublist',
                                    name: 'custpage_qty_req_kitchen',
                                    line: i
                                });
                                log.debug('itemQty', itemQty);
                                transferOrderRec.selectNewLine({
                                    sublistId: 'item'
                                });
                                transferOrderRec.setCurrentSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'item',
                                    value: itemId
                                });
                                transferOrderRec.setCurrentSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'units',
                                    value: transUnits
                                });
                                transferOrderRec.setCurrentSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'quantity',
                                    value: itemQty
                                });
                                transferOrderRec.commitLine({
                                    sublistId: 'item'
                                });
                            }
                        }
                        var transferOrderRecId = transferOrderRec.save();
                        log.debug('transferOrderRecId', transferOrderRecId);
                    }
                    if (internalTransferValue == 'F') {
                        var vendorId = request.parameters.custpage_vendor;
                        log.debug('vendorId', vendorId);
                        var currencyId = request.parameters.custpage_currency;
                        log.debug('currencyId', currencyId);
                        var purchaseOrderRec = record.create({
                            type: 'purchaseorder',
                            isDynamic: true
                        });
                        if (dateField) {
                            purchaseOrderRec.setValue('trandate', formattedDate);
                        }
                        purchaseOrderRec.setValue('entity', vendorId);
                        purchaseOrderRec.setValue('currency', currencyId);
                        var numLines = request.getLineCount({
                            group: 'custpage_report_sublist'
                        });
                        var checkBox, itemId, transUnits, itemQty;
                        for (var i = 0; i < numLines; i++) {
                            checkBox = request.getSublistValue({
                                group: 'custpage_report_sublist',
                                name: 'custpage_replenish',
                                line: i
                            });
                            log.debug('checkBox', checkBox);
                            if (checkBox == 'T') {
                                itemId = request.getSublistValue({
                                    group: 'custpage_report_sublist',
                                    name: 'custpage_item_id',
                                    line: i
                                });
                                log.debug('itemId', itemId);
                                transUnits = request.getSublistValue({
                                    group: 'custpage_report_sublist',
                                    name: 'custpage_tran_units',
                                    line: i
                                });
                                log.debug('transUnits', transUnits);
                                itemQty = request.getSublistValue({
                                    group: 'custpage_report_sublist',
                                    name: 'custpage_qty_req_kitchen',
                                    line: i
                                });
                                log.debug('itemQty', itemQty);
                                purchaseOrderRec.selectNewLine({
                                    sublistId: 'item'
                                });
                                purchaseOrderRec.setCurrentSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'item',
                                    value: itemId
                                });
                                purchaseOrderRec.setCurrentSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'units',
                                    value: transUnits
                                });
                                purchaseOrderRec.setCurrentSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'quantity',
                                    value: itemQty
                                });
                                purchaseOrderRec.commitLine({
                                    sublistId: 'item'
                                });
                            }
                        }
                        var purchaseOrderRecId = purchaseOrderRec.save();
                        log.debug('purchaseOrderRecId', purchaseOrderRecId);
                    }
                    var output1 = url.resolveScript({
                        scriptId: 'customscript_da_su_qty_req_kitchen',
                        deploymentId: 'customdeploy_da_su_qty_req_kitchen',
                        returnExternalUrl: false
                    });
                    log.debug('output1', output1);
                    redirect.redirect({
                        url: output1
                    });
                }
            } catch (ex) {
                log.error(ex.name, ex.message);
            }
        }
        return {
            onRequest: onRequest
        };
    });
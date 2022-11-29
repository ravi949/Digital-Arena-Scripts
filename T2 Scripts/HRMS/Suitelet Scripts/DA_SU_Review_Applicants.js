/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope TargetAccount
 */
define(
    ['N/ui/serverWidget', 'N/search', 'N/runtime', 'N/redirect',
        'N/record', 'N/url'
    ],

    function(ui, search, runtime, redirect, record, url) {

        /**
         * Definition of the Suitelet script trigger point.
         * 
         * @param {Object}
         *            context
         * @param {ServerRequest}
         *            context.request - Encapsulation of the incoming
         *            request
         * @param {ServerResponse}
         *            context.response - Encapsulation of the Suitelet
         *            response
         * @Since 2015.2
         */
        function onRequest(context) {
            try {
                var request = context.request;
                var response = context.response;

                if (context.request.method == 'GET') {

                    var form = ui.createForm({
                        title: 'Review Applicants'
                    });
                    form.addButton({
                        id: 'custom_reject',
                        label: 'Reject',
                        functionName: "setButton"
                    });
                    form.addButton({
                        id: 'return',
                        label: 'Invite Interview',
                        functionName: 'funButton'
                    });
                    form.addButton({
                        id: 'custom_mark_all',
                        label: 'Mark All',
                        functionName: "markAll"
                    });
                    form.addButton({
                        id: 'custom_unmark_all',
                        label: 'Unmark All',
                        functionName: 'unmarkAll'
                    });
                    var tab = form.addSubtab({
                        id: 'custpage_tab',
                        label: 'In Progress Applicants'
                    });
                    // Report Sublist
                    var reportList = form.addSublist({
                        id: 'custpage_report_data_sublist',
                        type: ui.SublistType.INLINEEDITOR,
                        label: 'Related Data',
                        tab: 'custpage_tab'
                    });
                    var hideFld = form.addField({
                        id: 'custpage_hide_buttons',
                        label: 'not shown - hidden',
                        container: 'custpage_tab',
                        type: ui.FieldType.INLINEHTML
                    });
                    var scr = "";
                    // scr +=
                    // 'jQuery("#custpage_report_data_sublist_buttons").hide();';
                    // scr +=
                    // 'jQuery("#custpage_report_data_sublist_insert").hide();';
                    scr += 'jQuery("#custpage_report_data_sublist_remove").hide();';

                    // push the script into the field so that it fires and
                    // does its handy work
                    hideFld.defaultValue = "<script>jQuery(function($){require([], function(){" +
                        scr + ";})})</script>"

                    var vacancy_ownerField = form.addField({
                        id: 'custpage_vacancy_owner',
                        type: ui.FieldType.SELECT,
                        label: 'Department',
                        container: 'custpage_tab',
                        source: 'department'
                    });
                    vacancy_ownerField.updateBreakType({
                        breakType: ui.FieldBreakType.STARTCOL
                    });
                    vacancy_ownerField.updateDisplaySize({
                        height: 250,
                        width: 145
                    });
                    var registered_vacancies_Field = form.addField({
                        id: 'custpage_registered_vacancies_id',
                        type: ui.FieldType.SELECT,
                        label: 'Available Vacancies',
                        container: 'custpage_tab',
                        source: 'customrecord_da_available_vacancies'
                    });
                    registered_vacancies_Field.updateBreakType({
                        breakType: ui.FieldBreakType.STARTCOL
                    });
                    registered_vacancies_Field.updateDisplaySize({
                        height: 250,
                        width: 190
                    });
                    var source_field = form.addField({
                        id: 'custpage_source',
                        type: ui.FieldType.SELECT,
                        label: 'Source',
                        container: 'custpage_tab',
                        source: 'customrecord_da_rec_source_list'
                    });
                    source_field.updateBreakType({
                        breakType: ui.FieldBreakType.STARTCOL
                    });
                    source_field.updateDisplaySize({
                        height: 250,
                        width: 130
                    });

                    var op_field = form.addField({
                        id: 'custpage_operator',
                        type: ui.FieldType.SELECT,
                        label: 'Weight From',
                        container: 'custpage_tab',
                        source: 'customlist_da_rec_weight_list'
                    });

                    op_field.updateBreakType({
                        breakType: ui.FieldBreakType.STARTCOL
                    });
                    op_field.updateDisplaySize({
                        height: 250,
                        width: 100
                    });
                    var total_weight_field = form.addField({
                        id: 'custpage_total_weight',
                        type: ui.FieldType.SELECT,
                        label: 'Weight To',
                        container: 'custpage_tab',
                        source: 'customlist_da_rec_weight_list'
                    });
                    total_weight_field.updateBreakType({
                        breakType: ui.FieldBreakType.STARTCOL
                    });
                    total_weight_field.updateDisplaySize({
                        height: 250,
                        width: 100
                    });
                    var paginationField = form.addField({
                        id: 'custpage_ss_pagination',
                        type: ui.FieldType.SELECT,
                        label: 'Results',
                        container: 'custpage_tab'
                    }).updateLayoutType({
                        layoutType: ui.FieldLayoutType.NORMAL
                    });
                    paginationField.updateBreakType({
                        breakType: ui.FieldBreakType.STARTCOL
                    });
                    paginationField.updateDisplaySize({
                        height: 250,
                        width: 130
                    });
                    reportList.addField({
                        id: 'custpage_reject',
                        type: ui.FieldType.CHECKBOX,
                        label: 'Check'
                    });

                    reportList.addField({
                        id: 'custpage_vacancy_owner',
                        type: ui.FieldType.DATE,
                        label: 'Registered Date'
                    }).updateDisplayType({
                        displayType: ui.FieldDisplayType.DISABLED
                    });
                    reportList.addField({
                        id: 'custpage_org_record_id',
                        type: ui.FieldType.INTEGER,
                        label: 'Record Id'
                    }).updateDisplayType({
                        displayType: ui.FieldDisplayType.DISABLED
                    });
                    var url = reportList.addField({
                        id: 'custpage_view',
                        type: ui.FieldType.TEXT,
                        label: 'View'
                    });
                    url.updateDisplayType({
                        displayType: ui.FieldDisplayType.HIDDEN
                    });

                    reportList.addField({
                        id: 'custpage_available_vacancies_id',
                        type: ui.FieldType.TEXT,
                        label: 'Available Vacancies'
                    }).updateDisplayType({
                        displayType: ui.FieldDisplayType.DISABLED
                    }).isMandatory = true;

                    reportList.addField({
                        id: 'custpage_name',
                        type: ui.FieldType.TEXT,
                        label: 'Name'
                    }).updateDisplayType({
                        displayType: ui.FieldDisplayType.DISABLED
                    });
                    reportList.addField({
                        id: 'custpage_nationality',
                        type: ui.FieldType.TEXT,
                        label: 'Nationality'
                    }).updateDisplayType({
                        displayType: ui.FieldDisplayType.DISABLED
                    });

                    reportList.addField({
                        id: 'custpage_job_title',
                        type: ui.FieldType.TEXT,
                        label: 'Job Title'
                    }).updateDisplayType({
                        displayType: ui.FieldDisplayType.DISABLED
                    });

                    reportList.addField({
                        id: 'custpage_department',
                        type: ui.FieldType.TEXT,
                        label: 'Department',
                        source: 'department'
                    }).updateDisplayType({
                        displayType: ui.FieldDisplayType.DISABLED
                    });
                    reportList.addField({
                        id: 'custpage_t_weight',
                        type: ui.FieldType.TEXT,
                        label: 'Total Weight',

                    }).updateDisplayType({
                        displayType: ui.FieldDisplayType.DISABLED
                    });
                    reportList.addField({
                        id: 'custpage_interview_date',
                        type: ui.FieldType.DATE,
                        label: 'Interview Date'
                    });
                    var myPagedData1, myPagedData2;

                    if (request.parameters.vacancy_owner ||
                        request.parameters.registered_vacancies ||
                        request.parameters.sourceid ||
                        request.parameters.weight ||
                        request.parameters.op) {
                        if (request.parameters.vacancy_owner) {
                            log.debug();
                            vacancy_ownerField.defaultValue = request.parameters.vacancy_owner;
                        }
                        if (request.parameters.registered_vacancies) {
                            registered_vacancies_Field.defaultValue = request.parameters.registered_vacancies;
                        }
                        if (request.parameters.sourceid) {
                            source_field.defaultValue = request.parameters.sourceid;
                        }
                        if (request.parameters.weight) {
                            total_weight_field.defaultValue = request.parameters.weight;
                        }
                        if (request.parameters.op) {
                            op_field.defaultValue = request.parameters.op;
                        }
                         log.debug();
                        myPagedData1 = searchForPendingFullfillmentData(
                            request.parameters.vacancy_owner,
                            request.parameters.registered_vacancies,
                            request.parameters.sourceid,
                            request.parameters.weight,
                            request.parameters.op);
                    } else {
                        myPagedData1 = searchForPendingFullfillmentData();
                    }
                     log.audit('myPagedData1', myPagedData1);
                    var totalResultCount = myPagedData1.count;

                    var listOfPages = myPagedData1["pageRanges"];
                    var numberOfPages = listOfPages.length;
                    if (numberOfPages > 0) {

                        var page = dataCount = null;
                        var startno = (request.parameters.startno) ? (request.parameters.startno) :  0;
                        // log.audit('listOfPages', listOfPages);
                        for (var i = 0; i < numberOfPages; i++) {
                            var paginationTextEnd = (totalResultCount >= (i * 500) + 500) ? ((i * 500) + 500) :
                                totalResultCount;
                            paginationField.addSelectOption({
                                value: listOfPages[i].index,
                                text: ((i * 500) + 1) + ' to ' +   paginationTextEnd + ' of ' + totalResultCount,
                                isSelected: (startno == i)
                            });
                        }

                        page = myPagedData1.fetch({
                            index: startno
                        });

                        dataCount = page.data.length;
                        var totalAmountFromCust = 0;
                        var i = 0;
                        myPagedData1.pageRanges.forEach(function(pageRange) {
                                if (myPagedData1.pageRanges.length <= 0)
                                    return;
                                var myPage = myPagedData1.fetch({
                                        index: (request.parameters.startno) ? (request.parameters.startno) : 0
                                    });
                                log.audit('my page',myPage);
                                // var i = 0;
                                // var arr = [];
                                myPage.data
                                    .forEach(function(result) {

                                        // log.debug(arr.indexOf(result.id));
                                        // log.debug('arr',arr);
                                        if (i <= 499) {
                                            // arr.push(result.id);

                                            var vacancy_owner = result
                                                .getValue({
                                                    name: 'custrecord_da_registered_date_new'
                                                });
                                            var source = result
                                                .getText({
                                                    name: 'custrecord_da_registerd_source'
                                                });
                                            var available_vacancies_ID = result
                                                .getText({
                                                    name: 'custrecord_da_registerd_vacanci'
                                                });
                                            var name = result
                                                .getValue({
                                                    name: 'name'
                                                });

                                            var nationality = result
                                                .getText({
                                                    name: 'custrecord_da_registerd_nationality'
                                                });

                                            var job_title = result
                                                .getText({
                                                    name: 'custrecord_da_reg_can_job_title'
                                                });

                                            var department = result
                                                .getText({
                                                    name: 'custrecord_da_reg_can_department'
                                                });
                                            var status = result
                                                .getText({
                                                    name: 'custrecord_da_job_vacancy_status'
                                                });
                                            var total_weight = result
                                                .getValue({
                                                    name: 'custrecord_da_registered_can_weight'
                                                });
                                            reportList
                                                .setSublistValue({
                                                    id: 'custpage_vacancy_owner',
                                                    line: i,
                                                    value: (vacancy_owner) ? vacancy_owner :
                                                        ' '
                                                });

                                            reportList.setSublistValue({
                                                id: 'custpage_view',
                                                line: i,
                                                value: "<html><style type='text/css'>a { text-decoration:none; }</style><a href=/app/common/custom/custrecordentry.nl?rectype=464&id=" + result.id + "&whence=><font color='#255599'>View</font></a></html>"
                                            });
                                            id = reportList
                                                .setSublistValue({
                                                    id: 'custpage_org_record_id',
                                                    line: i,
                                                    value: result.id
                                                });
                                            reportList
                                                .setSublistValue({
                                                    id: 'custpage_available_vacancies_id',
                                                    line: i,
                                                    value: (available_vacancies_ID) ? available_vacancies_ID :
                                                        ' '
                                                });
                                            reportList
                                                .setSublistValue({
                                                    id: 'custpage_name',
                                                    line: i,
                                                    value: (name) ? name :
                                                        ' '
                                                });

                                            reportList
                                                .setSublistValue({
                                                    id: 'custpage_nationality',
                                                    line: i,
                                                    value: (nationality) ? nationality :
                                                        ' '
                                                });

                                            reportList
                                                .setSublistValue({
                                                    id: 'custpage_job_title',
                                                    line: i,
                                                    value: (job_title) ? job_title :
                                                        ' '
                                                });
                                            reportList
                                                .setSublistValue({
                                                    id: 'custpage_department',
                                                    line: i,
                                                    value: (department) ? department :
                                                        ' '
                                                });
                                            reportList
                                                .setSublistValue({
                                                    id: 'custpage_t_weight',
                                                    line: i,
                                                    value: (total_weight) ? total_weight :
                                                        ' '
                                                });

                                            i++;
                                            return true;
                                        }
                                    });
                            });
                        var scriptObj = runtime.getCurrentScript();
                        log.debug("Remaining governance units: " +
                            scriptObj.getRemainingUsage());
                    } else {}

                    context.response.writePage(form);
                    form.clientScriptModulePath = './DA_CS_Review_Applicants_Attach.js';

                    /*
                     * var s = search.create({ type: "customrecordtype",
                     * filters:[["scriptid","is","CUSTOMRECORD_JOB_ORDER"]],
                     * columns: ["name","scriptid"] }).run().getRange(0,1);
                     * 
                     * var recordId = s[0].id; log.debug(s[0].id);
                     * //log.debug('numLines',numLines); redirect.redirect({
                     * url:
                     * '/app/common/custom/custrecordentry.nl?rectype='+recordId+'&itemSno='+sno
                     * });
                     */
                }

            } catch (ex) {
                log.error(ex.name, ex.message);
            }

        }

        function searchForPreviousJobs(itemsno) {

        }

        function searchForPendingFullfillmentData(vacancy_owner,  registered_vacancies, sourceid, weight, op) {
            log.debug('param');
            var customrecord_da_registered_candidateSearchObj = search.create({
                    type: "customrecord_da_registered_candidate",
                    filters: [search.createFilter({
                        "name": "custrecord_da_job_vacancy_status",
                        "operator": "anyof",
                        "values": 1
                    })],
                    columns: [search.createColumn({
                        name: "custrecord_da_registerd_vacanci",
                        sort: search.Sort.ASC,
                        label: "Available Vacancies"
                    }), search.createColumn({
                        name: "custrecord_da_registered_date_new",
                        label: "Registered Date"
                    }), search.createColumn({
                        name: "name",
                        label: "Name"
                    }), search.createColumn({
                        name: "custrecord_da_registerd_nationality",
                        label: "Nationality"
                    }), search.createColumn({
                        name: "custrecord_da_reg_can_job_title",
                        label: "Job Title"
                    }), search.createColumn({
                        name: "custrecord_da_reg_can_department",
                        label: "Department"
                    }), search.createColumn({
                        name: "custrecord_da_job_vacancy_status",
                        label: "Status"
                    }), search.createColumn({
                        name: "custrecord_da_registered_can_weight",
                        label: "Total Weight"
                    })]
                });
            //log.debug('2', vacancy_owner);
         if (vacancy_owner) {
                customrecord_da_registered_candidateSearchObj.filters.push(search.createFilter({
                        "name": "custrecord_da_reg_can_department",
                        "operator": "anyof",
                        "values": vacancy_owner
                    }));
            }


            if (registered_vacancies) {
              //  log.debug('sfws');
                customrecord_da_registered_candidateSearchObj.filters
                    .push(search.createFilter({
                        "name": "custrecord_da_registerd_vacanci",
                        "operator": "anyof",
                        "values": registered_vacancies
                    }));

            }
            
            if (sourceid) {
              //  log.debug('sfs');
                customrecord_da_registered_candidateSearchObj.filters
                    .push(search.createFilter({
                        "name": "custrecord_da_registerd_source",
                        "operator": "anyof",
                        "values": sourceid

                    }));

            }

            if (weight) {
              //  log.debug('weight');
                customrecord_da_registered_candidateSearchObj.filters
                    .push(search.createFilter({
                        "name": "custrecord_da_registered_can_weight",
                        "operator": "lessthanorequalto",
                        "values": weight

                    }));

            }
            
            if (op) {
               // log.debug('op');
                customrecord_da_registered_candidateSearchObj.filters
                    .push(search.createFilter({
                        "name": "custrecord_da_registered_can_weight",
                        "operator": "greaterthanorequalto",
                        "values": op
                    }));

            }

            var searchResultCount = customrecord_da_registered_candidateSearchObj.runPaged().count;
            log.debug("invoiceSearchObj result count", searchResultCount);

            var myPagedData = customrecord_da_registered_candidateSearchObj.runPaged({
                    pageSize: 500
            });
            return myPagedData;

        }

        return {
            onRequest: onRequest
        };

    });
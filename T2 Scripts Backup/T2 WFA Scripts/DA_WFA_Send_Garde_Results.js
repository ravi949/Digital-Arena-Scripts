/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 */
define(['N/search', 'N/record','N/email'],
    function(search, record, email) {
        /**
         * Definition of the Suitelet script trigger point.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @Since 2016.1
         */
        function onAction(scriptContext) {
            try {

                var rec = scriptContext.newRecord;

                var dataArr = [];

                var lineCount = scriptContext.newRecord.getLineCount({
                    sublistId: 'recmachcustrecord_da_generate_grade_aprent'
                });

                for (var i = 0; i < lineCount; i++) {
                    var emailId = rec.getSublistValue({
                        sublistId: 'recmachcustrecord_da_generate_grade_aprent',
                        fieldId: 'custrecord_da_student_email_grades',
                        line: i
                    });

                    log.debug(emailId);


                    if (true) {

                        var studentName = rec.getSublistText({
                            sublistId: 'recmachcustrecord_da_generate_grade_aprent',
                            fieldId: 'custrecord_da_grade_result_student',
                            line: i
                        });

                        var studentId = rec.getSublistValue({
                            sublistId: 'recmachcustrecord_da_generate_grade_aprent',
                            fieldId: 'custrecord_da_grade_result_student',
                            line: i
                        });

                         log.debug(studentId);



                        var htmlBody = '';

                        htmlBody = '<style>body { padding:20px; max-width:800px; margin:auto auto; font-family:sans; } table { width:100% } th { background:#666; color:#fff; } td { padding:5px; } input { width:100%; height: 24px; font-size: 18px; padding:2px; border:0; } h1 { font-weight: normal; }</style>';
                        htmlBody += '<b>Dear ' + studentName + '</b>, <br> Please find the grade results for your Course <h4>Batch : ' + scriptContext.newRecord.getText('custrecord_da_genarate_grade_batch') + '</h4><h5>Results :</h5> <table border ="4" id="customers" class="rwd-table">   <tr>  <th>Subject </th>      <th>Max Marks</th>      <th>Obtained Marks</th>     <th>Percentage</th></tr>';

                        var customrecord_da_amm_batch_studentsSearchObj = search.create({
                            type: "customrecord_da_amm_batch_students",
                            filters: [
                                ["custrecord_da_amm_test_parent.custrecord_da_amm_test_batch", "anyof", scriptContext.newRecord.getValue('custrecord_da_genarate_grade_batch')],
                                "AND",
                                ["custrecord_da_batch_student_name", "anyof", studentId]
                            ],
                            columns: [
                                search.createColumn({
                                    name: "scriptid",
                                    sort: search.Sort.ASC,
                                    label: "Script ID"
                                }),
                                search.createColumn({
                                    name: "custrecord_da_batch_student_name",
                                    label: "Student"
                                }),
                                search.createColumn({
                                    name: "custrecord_da_batch_student_sub_marks",
                                    label: "Max Marks"
                                }),
                                search.createColumn({
                                    name: "custrecord_da_student_marks_obtained",
                                    label: "Marks Obtained"
                                }),
                                search.createColumn({
                                    name: "custrecord_da_test_subject_name",
                                    join: "CUSTRECORD_DA_AMM_TEST_PARENT",
                                    label: "Subject Name"
                                })
                            ]
                        });
                        var searchResultCount = customrecord_da_amm_batch_studentsSearchObj.runPaged().count;
                        log.debug("customrecord_da_amm_batch_studentsSearchObj result count", searchResultCount);
                        customrecord_da_amm_batch_studentsSearchObj.run().each(function(result) {
                            var subName = result.getValue({
                                name: 'custrecord_da_test_subject_name',
                                join: 'CUSTRECORD_DA_AMM_TEST_PARENT'
                            });
                            var maxMarks = result.getValue('custrecord_da_batch_student_sub_marks');
                            var Obtained = result.getValue('custrecord_da_student_marks_obtained');

                            var Percentage = ((Obtained / maxMarks) * 100).toFixed(2);
                            htmlBody += '<tr><td data-th="Subject">' + subName + '</td><td data-th="Date">' + maxMarks + '</td><td data-th="to">' + Obtained + '</td><td data-th="Time To">' + Percentage + '</td></tr>';
                            return true;
                        });

                   
                    htmlBody += '</table>'
                    var totalmaxMarks = rec.getSublistValue({
                        sublistId: 'recmachcustrecord_da_generate_grade_aprent',
                        fieldId: 'custrecord_da_total_max_marks',
                        line: i
                    });
                    var totalObtained = rec.getSublistValue({
                        sublistId: 'recmachcustrecord_da_generate_grade_aprent',
                        fieldId: 'custrecord_da_total_marks_obtained',
                        line: i
                    });
                    var totalPercent = rec.getSublistText({
                        sublistId: 'recmachcustrecord_da_generate_grade_aprent',
                        fieldId: 'custrecord_da_garde_result_percent',
                        line: i
                    });
                    htmlBody += '<h5>Summary Results :</h5> <table border ="4" id="customers" class="rwd-table">   <tr> <th>Max Marks</th>      <th>Obtained Marks</th>     <th>Percentage</th></tr>';
                    htmlBody += '<tr><td data-th="Date">' + totalmaxMarks + '</td><td data-th="to">' + totalObtained + '</td><td data-th="Time To">' + totalPercent + '</td></tr>';
                    htmlBody += '</table>'

                    htmlBody = "<html>" + htmlBody + "</html><script type='text/javascript'></script>"
                    log.debug('s', htmlBody);

                    try{
                       email.send({
                        author: scriptContext.newRecord.getValue('owner'),
                        recipients: studentId,
                        subject: 'Course Results',
                        body: htmlBody
                    });
                     }catch(ex){
                      log.error(ex.name,ex.message);
                     }

                   

                }

                 }




            } catch (ex) {
                log.error(ex.name, ex.message);
            }
        }
        return {
            onAction: onAction
        };
    });
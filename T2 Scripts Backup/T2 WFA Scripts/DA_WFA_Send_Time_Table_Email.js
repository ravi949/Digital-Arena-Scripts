/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 */
define(['N/task', 'N/search', 'N/record','N/email'],
    function(task, search, record, email) {
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
              
              
                var customrecord_da_amm_time_table_recordSearchObj = search.create({
                    type: "customrecord_da_amm_time_table_record",
                    filters: [
                        ["custrecord_da_amm_tt_student", "anyof", scriptContext.newRecord.getValue('custrecord_da_amm_email_tt_customer')],
                        "AND",
                        ["custrecord_da_amm_tt_batch", "anyof", scriptContext.newRecord.getValue('custrecord_da_amm_batch_id')]
                    ],
                    columns: [
                        search.createColumn({
                            name: "custrecord_da_amm_tt_sub_name",
                            label: "Subject Name"
                        }),
                        search.createColumn({
                            name: "custrecord_da_amm_tt_date",
                            sort: search.Sort.ASC,
                            label: "Date"
                        }),
                        search.createColumn({
                            name: "custrecord_da_amm_tt_batch_time_from",
                            label: "Time From"
                        }),
                        search.createColumn({
                            name: "custrecord_da_amm_tt_time_to",
                            label: "Time To"
                        }),
                        search.createColumn({
                            name: "custrecord_da_sub_tt_room_no",
                            label: "Room No"
                        }),
                        search.createColumn({
                            name: "custrecord_da_amm_tt_beauitician_name",
                            label: "Beautician Name"
                        })
                    ]
                });
                var searchResultCount = customrecord_da_amm_time_table_recordSearchObj.runPaged().count;
                log.debug("customrecord_da_amm_time_table_recordSearchObj result count", searchResultCount);
                var dataArr = [];
                customrecord_da_amm_time_table_recordSearchObj.run().each(function(result) {
                    var emailObj = {
                        'date': result.getValue('custrecord_da_amm_tt_date'),
                        'subjectName': result.getText('custrecord_da_amm_tt_sub_name'),
                        'timeFrom': result.getText('custrecord_da_amm_tt_batch_time_from'),
                        'timeTo': result.getValue('custrecord_da_amm_tt_time_to'),
                        'roomNo': result.getText('custrecord_da_sub_tt_room_no'),
                        'beauticianName': result.getText('custrecord_da_amm_tt_beauitician_name')
                    };
                    dataArr.push(emailObj);
                    // .run().each has a limit of 4,000 results
                    return true;
                });

                if (dataArr.length > 0) {
                var htmlBody = '';
               
                htmlBody = '<style>body { padding:20px; max-width:800px; margin:auto auto; font-family:sans; } table { width:100% } th { background:#666; color:#fff; } td { padding:5px; } input { width:100%; height: 24px; font-size: 18px; padding:2px; border:0; } h1 { font-weight: normal; }</style><b>Dear '+scriptContext.newRecord.getText('custrecord_da_amm_email_tt_customer')+'</b>, <br> Please find the time table for your Registered Batch <br><h4>Batch : '+scriptContext.newRecord.getText('custrecord_da_amm_batch_id')+'</h4><h4>Course : '+scriptContext.newRecord.getText('custrecord_da_amm_batch_id')+'</h4> <h5>Time Table :</h5> <table border ="4" id="customers" class="rwd-table">   <tr>     <th>Date</th>     <th>Subject </th>     <th>Time From</th>     <th>Time To</th>  <th>Room No</th>  <th>Beautician</th>   </tr>';
                  
                   for (i in dataArr) {
                    htmlBody += '<tr><td data-th="Date">' + dataArr[i].date+ '</td><td data-th="Subject">' + dataArr[i].subjectName+ '</td><td data-th="Time From">' + dataArr[i].timeFrom+ '</td><td data-th="Time To">'+dataArr[i].timeTo+'</td><td data-th="Room No">' + dataArr[i].roomNo+ '</td><td data-th="Beautician">'+dataArr[i].beauticianName+'</td></tr>';
                }
                  htmlBody += '</table>'

               // var css = '#customers { font-family: "Trebuchet MS", Arial, Helvetica, sans-serif; border-collapse: collapse; width: 100%; } td, th { border: 1px solid #ddd; padding: 8px; } #customers tr:nth-child(even){background-color: #f2f2f2;} #customers tr:hover {background-color: #ddd;} #customers th { padding-top: 12px; padding-bottom: 12px; text-align: left; background-color: #4CAF50; color: white; }';



                htmlBody = "<html>"+htmlBody+"</html><script type='text/javascript'></script>"
                log.debug('s',htmlBody);

                email.send({
                    author : scriptContext.newRecord.getValue('owner'),
                    recipients : scriptContext.newRecord.getValue('custrecord_da_amm_email_tt_customer'),
                    subject : 'Time Table',
                    body : htmlBody
                });

            }
            } catch (ex) {
                log.error(ex.name, ex.message);
            }
        }
        return {
            onAction: onAction
        };
    });
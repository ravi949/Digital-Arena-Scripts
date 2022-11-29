/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope TargetAccount
 */
define(['N/ui/message', 'N/ui/serverWidget', 'N/search', 'N/runtime', 'N/record','N/format'],
	function(message, serverWidget, search, runtime, record , format) {
		/**
		 * Function definition to be triggered before record is loaded.
		 *
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.newRecord - New record
		 * @param {string} scriptContext.type - Trigger type
		 * @param {Form} scriptContext.form - Current form
		 * @Since 2015.2
		 */
		function beforeLoad(scriptContext) {}
		/**
		 * Function definition to be triggered before record is loaded.
		 *
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.newRecord - New record
		 * @param {Record} scriptContext.oldRecord - Old record
		 * @param {string} scriptContext.type - Trigger type
		 * @Since 2015.2
		 */
		function beforeSubmit(scriptContext) {
			log.debug('beforeSubmit', 'beforeSubmit');
		}
		/**
		 * Function definition to be triggered before record is loaded.
		 *
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.newRecord - New record
		 * @param {Record} scriptContext.oldRecord - Old record
		 * @param {string} scriptContext.type - Trigger type
		 * @Since 2015.2
		 */
  function getDates(startDate, endDate) {
            var dates = [],
                currentDate = startDate,
                addDays = function(days) {
                    var date = new Date(this.valueOf());
                    date.setDate(date.getDate() + days);
                    return date;
                };
            while (currentDate <= endDate) {
                dates.push(currentDate);
                currentDate = addDays.call(currentDate, 1);
            }
            return dates;
        };
		function afterSubmit(scriptContext) {
			try {
				//Creating Events
				var customrecord_da_amm_time_table_recordSearchObj = search.create({
					type: "customrecord_da_amm_time_table_record",
					filters: [
						["custrecord_da_amm_tt_batch_subject", "anyof", scriptContext.newRecord.id],
						"AND",
						["custrecord_da_student_name", "isempty", ""]
					],
					columns: [
						search.createColumn({
							name: "custrecord_da_amm_tt_batch",
							label: "Batch"
						}),
						search.createColumn({
							name: "custrecord_da_amm_tt_batch_course",
							label: "Course"
						}),
						search.createColumn({
							name: "custrecord_da_amm_tt_batch_subject",
							label: "Subject Link"
						}),
						search.createColumn({
							name: "custrecord_da_amm_tt_sub_name",
							label: "Subject Name"
						}),
						search.createColumn({
							name: "custrecord_da_amm_tt_date",
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
						}),
						search.createColumn({
							name: "custrecord_da_amm_tt_event_id",
							label: "Session Id"
						}),
                      	search.createColumn({
							name: "custrecord_da_time_table_date_to",
							label: "Date To"
						}),
					]
				});
				var searchResultCount = customrecord_da_amm_time_table_recordSearchObj.runPaged().count;
				log.debug("customrecord_da_amm_time_table_recordSearchObj result count", searchResultCount);
				customrecord_da_amm_time_table_recordSearchObj.run().each(function(result) {
                  
                   var date1 = result.getValue('custrecord_da_amm_tt_date');
                   var dateTo = result.getValue('custrecord_da_time_table_date_to');
                  
                   var parsedDateStringAsRawDateObject = format.parse({
                                    value: date1,
                                    type: format.Type.DATE
                                });
                              var parsedDateStringAsRawDateObjectDateTo = format.parse({
                                    value: dateTo,
                                    type: format.Type.DATE
                                });
                   var dates = getDates(parsedDateStringAsRawDateObject, parsedDateStringAsRawDateObjectDateTo);
                            dates.forEach(function(date) {
                              log.debug('dateee', date);
                          

					var sessionCreated = result.getValue('custrecord_da_amm_tt_event_id');

					if(sessionCreated){
						var eventRec = record.load({
							type: 'calendarevent',
							id: sessionCreated,
							isDynamic: true
						});

					}else{
						var eventRec = record.create({
							type: 'calendarevent',
							isDynamic: true
						});
					}
					var date2 = result.getValue('custrecord_da_amm_tt_date');
					var beauticianName = result.getText('custrecord_da_amm_tt_beauitician_name');
					var Beautician = result.getValue('custrecord_da_amm_tt_beauitician_name');
					var timeFrom = result.getText('custrecord_da_amm_tt_batch_time_from');
					log.debug('timeFrom', timeFrom);
					var roomNo = result.getValue('custrecord_da_sub_tt_room_no');
					timeFrom = format.parse({
						value: timeFrom,
						type: format.Type.TIMEOFDAY
					});
					log.debug('aftimeFrom', timeFrom);
					var timeTo = result.getValue('custrecord_da_amm_tt_time_to');
					log.debug('timeTo', timeTo);
					timeTo = format.parse({
						value: timeTo,
						type: format.Type.TIMEOFDAY
					});
					log.debug('aftimeTo', timeTo);
					var parsedDateStringAsRawDateObject = format.parse({
						value: date2,
						type: format.Type.DATE
					});
					//log.debug('parsedDateStringAsRawDateObject', new Date(parsedDateStringAsRawDateObject));
					var formattedDateString = format.format({
						value: parsedDateStringAsRawDateObject,
						type: format.Type.DATE
					});
					
					var title = formattedDateString + ":" + beauticianName + ":" + result.getText('custrecord_da_amm_tt_sub_name') + "(" + result.getText('custrecord_da_amm_tt_batch_time_from') + "--" + result.getValue('custrecord_da_amm_tt_time_to') + ")";
					log.debug('title', title);
					eventRec.setValue('title', title);
					eventRec.removeLine({
						sublistId: 'attendee',
						line: 0
					});
                              eventRec.setValue('accesslevel', "PUBLIC");
					eventRec.setValue('organizer', Beautician);
					eventRec.setValue('custevent_da_subject_ref', scriptContext.newRecord.id);
					eventRec.setValue('location', result.getText('custrecord_da_sub_tt_room_no'));
					eventRec.setValue('startdate', date);
					eventRec.setValue('starttime', timeFrom);
					eventRec.setValue('endtime', timeTo);
					eventRec.setValue('message', "Batch :" + result.getText('custrecord_da_amm_tt_batch') + "; And Course : " + result.getText('custrecord_da_amm_tt_batch_course'));
					eventRec.selectNewLine({
						sublistId: 'attendee'
					});
					eventRec.setCurrentSublistValue({
						sublistId: 'attendee',
						fieldId: 'attendee',
						value: Beautician
					});
					eventRec.setCurrentSublistValue({
						sublistId: 'attendee',
						fieldId: 'response',
						value: "ACCEPTED"
					});
					eventRec.commitLine({
						sublistId: 'attendee'
					});
					eventId = eventRec.save();
					if (eventId) {
						var recAttn = record.create({
							type: 'customrecord_da_amm_attendance_database'
						});
						recAttn.setValue('custrecord_da_bam_session_id', eventId);
						recAttn.save();
						record.submitFields({
							type: 'customrecord_da_amm_time_table_record',
							id: result.id,
							values: {
								'custrecord_da_amm_tt_event_id': eventId
							}
						})
					}
					return true;
                });
				});
				var customrecord_da_amm_batch_subjectsSearchObj = search.create({
					type: "customrecord_da_amm_batch_subjects",
					filters: [
						["custrecord_da_amm_batch_parent", "anyof", scriptContext.newRecord.getValue('custrecord_da_amm_batch_parent')]
					],
					columns: [
						search.createColumn({
							name: "id",
							sort: search.Sort.ASC,
							label: "ID"
						})
					]
				});
				var totalBatchSubjects = customrecord_da_amm_batch_subjectsSearchObj.runPaged().count;
				log.debug("customrecord_da_amm_batch_subjectsSearchObj result count", totalBatchSubjects);
				customrecord_da_amm_batch_subjectsSearchObj.filters.push(search.createFilter({
					"name": "custrecord_da_amm_time_allotted",
					"operator": "is",
					"values": 'T'
				}));
				var allotedCount = customrecord_da_amm_batch_subjectsSearchObj.runPaged().count;
				log.debug("customrecord_da_amm_batch_subjectsSearchObj result count", allotedCount);
				if (totalBatchSubjects == allotedCount) {
					record.submitFields({
						type: 'customrecord_da_amm_setup_batch',
						id: scriptContext.newRecord.getValue('custrecord_da_amm_batch_parent'),
						values: {
							'custrecord_da_amm_setup_batch_status_1': 4 // time schedules alloted
						}
					})
				}
			} catch (ex) {
				log.error(ex.name, ex.message);
			}
		}

		function removeDuplicateUsingFilter(arr) {
			var unique_array = arr.filter(function(elem, index, self) {
				return index == self.indexOf(elem);
			});
			return unique_array
		}
		return {
			//	beforeLoad: beforeLoad,
			beforeSubmit: beforeSubmit,
			afterSubmit: afterSubmit
		};
	});
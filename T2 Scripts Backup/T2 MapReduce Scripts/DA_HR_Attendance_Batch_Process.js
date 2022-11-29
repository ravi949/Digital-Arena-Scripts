/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope TargetAccount
 */

define(['N/search', 'N/record', 'N/runtime', 'N/format'],
	function(search, record, runtime, format) {
		/**
		 * Marks the beginning of the Map/Reduce process and generates input data.
		 *
		 * @typedef {Object} ObjectRef
		 * @property {number} id - Internal ID of the record instance
		 * @property {string} type - Record type id
		 *
		 * @return {Array|Object|Search|RecordRef} inputSummary
		 * @since 2015.1
		 */
		function getInputData() {
			try {
				//attendance creation 
				var today_date = new Date();
				var todays_day = today_date.getDate();
				var today_month = today_date.getMonth() + 1;
				var today_year = today_date.getFullYear();
				today_date = todays_day + "/" + today_month + "/" + today_year;
				log.debug('today_date', today_date);
				var flag = true;
				var date_type;
				var customrecord_da_holiday_datesSearchObj = search.create({
					type: "customrecord_da_holiday_dates",
					filters: [
						["custrecord_holiday_date", "on", today_date]
					],
					columns: [search.createColumn({
						name: "custrecord_holiday_date",
						label: "Date"
					})]
				});
				var searchResultCount = customrecord_da_holiday_datesSearchObj.runPaged().count;
				log.debug("customrecord_da_holiday_datesSearchObj result count", searchResultCount);
				if (searchResultCount > 0) {
					date_type = 3;
					flag = false;
				}
				if (flag) {
					var today1 = new Date();
					var customrecord_da_leave_general_settingsSearchObj = search.create({
						type: "customrecord_da_general_settings",
						columns: [
							search.createColumn({
								name: "custrecord_non_working_days",
								label: "Non Working Days (In a Week)"
							})
						]
					});
					var nonWorkingDays = [];
					customrecord_da_leave_general_settingsSearchObj.run().each(function(result) {
						nonWorkingDays.push(result.getValue('custrecord_non_working_days').split(","));
					});
					log.debug(nonWorkingDays);
					for (var i = 0; i < nonWorkingDays[0].length; i++) {
						log.debug(nonWorkingDays[0][i]);
						if (today1.getDay() == (parseFloat(nonWorkingDays[0][i]) - 1)) {
							date_type = 2;
							flag = false;
						}
					}
				}
				if (flag) {
					date_type = 1;
				}
				log.debug('date_type', date_type);
				var attendancerecord = record.create({
					type: 'customrecord_da_hr_attendence'
				});
				attendancerecord.setValue('custrecord_da_att_select_type', 2); //regual attendance
				attendancerecord.setText('custrecord_da_att_select_date', today_date);
				attendancerecord.setValue('custrecord_da_att_date_type', date_type);
				attendancerecord.save({
					enableSourcing: false,
					ignoreMandatoryFields: true
				});
				//sending employess based on subsidairy
				var featureEnabled = runtime.isFeatureInEffect({
					feature: 'SUBSIDIARIES'
				});
				if (featureEnabled) {
					var subsidiarySearchObj = search.create({
						type: "subsidiary",
						filters: [
							["iselimination", "is", "F"]
						],
						columns: [
							search.createColumn({
								name: "currency",
								label: "Currency"
							})
						]
					});
					var searchResultCount = subsidiarySearchObj.runPaged().count;
					log.debug("subsidiarySearchObj result count", searchResultCount);
					var subsidaryArr = [];
					subsidiarySearchObj.run().each(function(result) {
						var customrecord_da_general_settingsSearchObj = search.create({
							type: "customrecord_da_general_settings",
							filters: [
								["custrecord_da_settings_subsidiary", "anyof", result.id], "AND", ["custrecord_da_attendance_batch_process", "is", "T"]
							],
							columns: [
								search.createColumn({
									name: "scriptid",
									sort: search.Sort.ASC,
									label: "Script ID"
								}),
								search.createColumn({
									name: "custrecord_da_settings_subsidiary",
									label: "Subsidiary"
								})
							]
						});
						var searchResultCount = customrecord_da_general_settingsSearchObj.runPaged().count;
						log.debug("customrecord_da_general_settingsSearchObj result count", searchResultCount);
						customrecord_da_general_settingsSearchObj.run().each(function(result) {
							subsidaryArr.push(result.getValue('custrecord_da_settings_subsidiary'));
							return true;
						});
						return true;
					});
					if (subsidaryArr.length > 0) {
						return search.create({
							type: "employee",
							filters: [ //["custentity_da_emp_include_in_payroll", "is", "T"], "AND", 
								["subsidiary", "anyof", subsidaryArr], "AND", ["isinactive", "is", false], "AND", ["employeestatus", "noneof", "10"] //terminated
							],
							columns: [
								search.createColumn({
									name: "internalid",
									sort: search.Sort.ASC,
									label: "id"
								}),
								search.createColumn({
									name: "email",
									label: "Email"
								}),
								search.createColumn({
									name: "phone",
									label: "Phone"
								})
							]
						});
					}
				} else {
					var customrecord_da_general_settingsSearchObj = search.create({
						type: "customrecord_da_general_settings",
						filters: [
							["custrecord_da_attendance_batch_process", "is", "T"]
						],
						columns: []
					});
					var searchResultCount = customrecord_da_leave_general_settingsSearchObj.runPaged().count;
					log.debug("customrecord_da_leave_general_settingsSearchObj result count", searchResultCount);
					if (searchResultCount > 0) {
						return search.create({
							type: "employee",
							filters: [ //["custentity_da_emp_include_in_payroll", "is", "T"], "AND", 
								["isinactive", "is", false], "AND", ["employeestatus", "noneof", "10"] //terminated
							],
							columns: [
								search.createColumn({
									name: "internalid",
									sort: search.Sort.ASC,
									label: "id"
								}),
								search.createColumn({
									name: "email",
									label: "Email"
								}),
								search.createColumn({
									name: "phone",
									label: "Phone"
								})
							]
						});
					}
				}
			} catch (ex) {
				log.error(ex.name, 'getInputData state, message = ' + ex.message);
			}
		}
		/**
		 * Executes when the map entry point is triggered and applies to each key/value pair.
		 *
		 * @param {MapSummary} context - Data collection containing the key/value pairs to process through the map stage
		 * @since 2015.1
		 */
		function map(context) {
			try {
				var searchResult = JSON.parse(context.value);
				var values = searchResult.values;
				var empId = values.internalid.value;
				log.debug('EMpID', empId);
				context.write({
					key: empId,
					value: empId
				})
			} catch (ex) {
				log.error(ex.name, ex.message);
			}
		}
		/**
		 * Executes when the reduce entry point is triggered and applies to each group.
		 *
		 * @param {ReduceSummary} context - Data collection containing the groups to process through the reduce stage
		 * @since 2015.1
		 */
		function reduce(context) {
			try {
				var empId = JSON.parse(context.key);
				log.debug('empId', empId);
				var empRecord = record.load({
					type: 'employee',
					id: empId
				});
				var today_date = new Date();
				var todays_day = today_date.getDate();
				var today_month = today_date.getMonth() + 1;
				var today_year = today_date.getFullYear();
				today_date = "01/" + today_month + "/" + today_year;
				log.debug('today_date', today_date);
				var customrecord_da_month_wise_leaveSearchObj = search.create({
					type: "customrecord_da_month_wise_leave",
					filters: [
						["custrecord_da_month_leave_start_date", "onorafter", today_date],
						"AND",
						["custrecord_da_month_employee", "anyof", empId]
					],
					columns: [
						search.createColumn({
							name: "id",
							sort: search.Sort.ASC,
							label: "ID"
						}),
						search.createColumn({
							name: "custrecord_da_leave_record",
							label: "Leave"
						})
					]
				});
				var searchResultCount = customrecord_da_month_wise_leaveSearchObj.runPaged().count;
				log.debug("customrecord_da_month_wise_leaveSearchObj result count", searchResultCount);
				var leaveExists = false;
				customrecord_da_month_wise_leaveSearchObj.run().each(function(result) {
					var leaveId = result.getValue('custrecord_da_leave_record');
					var lookup = search.lookupFields({
						type: 'customrecord_da_leaves',
						id: leaveId,
						columns: ['custrecord_da_leave_start_date', 'custrecord_da_leave_end_date']
					});
					var sDate = (lookup.custrecord_da_leave_start_date);
					var eDate = (lookup.custrecord_da_leave_end_date);
					var sLeaveMonth = Number(sDate.split("/")[1]);
					var eLeaveMonth = Number(eDate.split("/")[1]);
					log.debug('sLeaveMonth', sLeaveMonth);
					var today_date = new Date().getDate();
					var today_month = new Date().getMonth() + 1;
					var sLeaveDate = Number(sDate.split("/")[0]);
					var eLeaveDate = Number(eDate.split("/")[0]);
					if (sLeaveMonth < eLeaveMonth) {
						if (sLeaveMonth == today_month) {
							if (sLeaveDate >= today_date) {
								leaveExists = true;
							}
						}
						if (eLeaveMonth == today_month) {
							if (today_date <= eLeaveDate) {
								leaveExists = true;
							}
						}
					} else {
						log.debug('else');
						// log.debug('sLeaveDate ',eLeaveDate <= today_date);
						//log.debug('sLeaveDate ',eLeaveDate +" "+ today_date);
						if (today_date >= sLeaveDate && today_date <= eLeaveDate) {
							leaveExists = true;
						}
					}
					return true;
				});
				//
				// log.debug('edate', eDate.split("/")[1]);
				log.debug('leaveExists', leaveExists);
				if (!leaveExists) {
					var customrecord_da_hr_attendenceSearchObj = search.create({
						type: "customrecord_da_hr_attendence",
						filters: [],
						columns: [
							search.createColumn({
								name: "id",
								label: "ID"
							}),
							search.createColumn({
								name: "scriptid",
								label: "Script ID"
							}),
							search.createColumn({
								name: "custrecord_da_att_select_type",
								label: "Select Type"
							}),
							search.createColumn({
								name: "custrecord_da_att_select_date",
								sort: search.Sort.DESC,
								label: "Select Date"
							}),
							search.createColumn({
								name: "custrecord_da_att_date_type",
								label: "Date Type"
							})
						]
					});
					var searchResultCount = customrecord_da_hr_attendenceSearchObj.runPaged().count;
					log.debug("customrecord_da_hr_attendenceSearchObj result count", searchResultCount);
					var attendancerecordId, dateType;
					customrecord_da_hr_attendenceSearchObj.run().each(function(result) {
						attendancerecordId = result.id;
						dateType = result.getValue('custrecord_da_att_date_type');
						// return true;
					});
					log.debug('attendancerecordId', attendancerecordId);
					if (attendancerecordId) {
						var workingHoursPerDay = record.load({
							type: 'customrecord_da_general_settings',
							id: 1
						}).getValue('custrecord_working_hours_per_day');
						if (workingHoursPerDay > 0) {
							var attendance = record.create({
								type: 'customrecord_da_attendance_details'
							});
							attendance.setValue('custrecord_da_attendance_parent', attendancerecordId);
							attendance.setValue('custrecord_da_atten_details_employee', empId);
							attendance.setValue('custrecord_da_att_details_hours', workingHoursPerDay);
							attendance.setValue('custrecord_da_atten_details_status', dateType);
							attendance.save({
								enableSourcing: false,
								ignoreMandatoryFields: true
							});
						}
					}
				}
			} catch (ex) {
				log.error(ex.name, ex.message);
			}
		}

		function calculateNoOfDays(date2, date1) {
			var res = Math.abs(date1 - date2) / 1000;
			var days = Math.floor(res / 86400);
			return days + 1;
		}

		function isFirstDay(dt) {
			var firstDay = new Date(dt.getFullYear(), dt.getMonth(), 1);
			if (firstDay.getDate() == dt.getDate()) {
				return true;
			} else {
				return false;
			}
		}

		function getLastDateOFPrevMonth(endDate) {
			var kuwaitTime = format.format({
				value: endDate,
				type: format.Type.DATETIME,
				timezone: format.Timezone.ASIA_RIYADH
			});
			var d = new Date(endDate);
			d.setDate(1);
			d.setHours(-20);
			return d;
		}

		function getFirstDateOfNextMonth(now) {
			if (now.getMonth() == 11) {
				var current = new Date(now.getFullYear() + 1, 0, 1);
				return current;
			} else {
				var current = new Date(now.getFullYear(), now.getMonth() + 1, 1);
				return current;
			}
		}

		function isLastDay(dt) {
			var test = new Date(dt.getTime()),
				month = test.getMonth();
			test.setDate(test.getDate() + 1);
			return test.getMonth() !== month;
		}

		function diff_months(dt2, dt1) {
			var diff = (dt2.getTime() - dt1.getTime()) / 1000;
			diff /= (60 * 60 * 24 * 7 * 4);
			return Math.floor(Math.abs(diff));
		}

		function daysInMonth(month, year) {
			return new Date(year, month, 0).getDate();
		}

		function convertminutes(hours, minutes) {
			return Number((hours * 60)) + Number(minutes);
		}
		/**
		 * Executes when the summarize entry point is triggered and applies to the result set.
		 *
		 * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
		 * @since 2015.1
		 */
		function summarize(summary) {
			try {} catch (ex) {
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
			getInputData: getInputData,
			map: map,
			reduce: reduce,
			summarize: summarize
		};
	});
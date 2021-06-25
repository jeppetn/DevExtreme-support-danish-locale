import BaseAppointmentsStrategy from './ui.scheduler.appointments.strategy.base';
import dateUtils from '../../../core/utils/date';
import { ExpressionUtils } from '../expressionUtils';

const DEFAULT_APPOINTMENT_HEIGHT = 60;
const MIN_APPOINTMENT_HEIGHT = 35;
const DROP_DOWN_BUTTON_OFFSET = 2;

const toMs = dateUtils.dateToMilliseconds;

class HorizontalRenderingStrategy extends BaseAppointmentsStrategy {
    _needVerifyItemSize() {
        return true;
    }

    calculateAppointmentWidth(appointment, position) {
        const cellWidth = this.getDefaultCellWidth() || this.getAppointmentMinSize();
        const allDay = ExpressionUtils.getField(this.key, 'allDay', appointment);
        const startDate = position.info.appointment.startDate;
        const endDate = this.normalizeEndDateByViewEnd(appointment, position.info.appointment.endDate);

        let appointmentDuration = this._getAppointmentDurationInMs(startDate, endDate, allDay);

        appointmentDuration = this._adjustDurationByDaylightDiff(appointmentDuration, startDate, endDate);

        const cellDuration = this.instance.getAppointmentDurationInMinutes() * toMs('minute');
        const durationInCells = appointmentDuration / cellDuration;
        const width = this.cropAppointmentWidth(durationInCells * cellWidth, cellWidth);

        return width;
    }

    _needAdjustDuration(diff) {
        return diff < 0;
    }

    getAppointmentGeometry(coordinates) {
        const result = this._customizeAppointmentGeometry(coordinates);

        return super.getAppointmentGeometry(result);
    }

    _customizeAppointmentGeometry(coordinates) {
        const config = this._calculateGeometryConfig(coordinates);

        return this._customizeCoordinates(coordinates, config.height, config.appointmentCountPerCell, config.offset);
    }

    _getOffsets() {
        return {
            unlimited: 0,
            auto: 0
        };
    }

    _getCompactLeftCoordinate(itemLeft, index) {
        const cellWidth = this.getDefaultCellWidth() || this.getAppointmentMinSize();

        return itemLeft + cellWidth * index;
    }

    _getMaxHeight() {
        return this.getDefaultCellHeight() || this.getAppointmentMinSize();
    }

    _getAppointmentCount(overlappingMode, coordinates) {
        return this._getMaxAppointmentCountPerCellByType(false);
    }

    _getAppointmentDefaultHeight() {
        return DEFAULT_APPOINTMENT_HEIGHT;
    }

    _getAppointmentMinHeight() {
        return MIN_APPOINTMENT_HEIGHT;
    }

    _sortCondition(a, b) {
        return this._columnCondition(a, b);
    }

    _getOrientation() {
        return ['left', 'right', 'top'];
    }

    _getMaxAppointmentWidth(startDate) {
        return this.instance.fire('getMaxAppointmentWidth', {
            date: startDate,
        });
    }

    getDropDownAppointmentWidth() {
        return this.getDefaultCellWidth() - DROP_DOWN_BUTTON_OFFSET * 2;
    }

    getDeltaTime(args, initialSize) {
        let deltaTime = 0;
        const deltaWidth = args.width - initialSize.width;

        deltaTime = toMs('minute') * Math.round(deltaWidth / this.getDefaultCellWidth() * this.instance.getAppointmentDurationInMinutes());

        return deltaTime;
    }

    isAllDay(appointmentData) {
        return ExpressionUtils.getField(this.key, 'allDay', appointmentData);
    }

    needSeparateAppointment() {
        return this.instance.fire('isGroupedByDate');
    }
}

export default HorizontalRenderingStrategy;

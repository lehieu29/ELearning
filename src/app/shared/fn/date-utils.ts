import dayjs from 'dayjs';
import 'dayjs/locale/vi'; // Import tiếng Việt locale
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import customParseFormat from 'dayjs/plugin/customParseFormat';

// Cấu hình plugins dayjs
dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(advancedFormat);
dayjs.extend(customParseFormat);

// Đặt locale mặc định là tiếng Việt
dayjs.locale('vi');

/**
 * Class tiện ích xử lý ngày tháng sử dụng dayjs
 */
export class DateUtils {
  /**
   * Trả về đối tượng dayjs với thời gian hiện tại hoặc chuyển đổi từ dữ liệu ngày tháng khác
   * @param input Dữ liệu ngày tháng (Date, string, number) hoặc không có để lấy thời gian hiện tại
   * @param format Định dạng của chuỗi thời gian (chỉ dùng khi input là string)
   * @returns Đối tượng dayjs tương ứng
   */
  static dayjs(input?: Date | string | number, format?: string): dayjs.Dayjs {
    if (input === undefined) {
      return dayjs();
    }
    
    if (typeof input === 'string' && format) {
      return dayjs(input, format);
    }
    
    return dayjs(input);
  }

  /**
   * Định dạng ngày tháng theo mẫu chuỗi
   * @param date Đối tượng Date, chuỗi ngày tháng, hoặc timestamp
   * @param formatString Chuỗi định dạng (mặc định: 'DD/MM/YYYY')
   * @returns Chuỗi ngày tháng đã định dạng
   */
  static format(date: Date | string | number, formatString: string = 'DD/MM/YYYY'): string {
    return DateUtils.dayjs(date).format(formatString);
  }

  /**
   * Chuyển đổi thời gian thành chuỗi thời gian tương đối
   * (Ví dụ: "2 giờ trước", "3 ngày nữa")
   * @param date Đối tượng Date, chuỗi ngày tháng, hoặc timestamp
   * @param baseDate Thời điểm cơ sở để so sánh (mặc định: thời gian hiện tại)
   * @returns Chuỗi thời gian tương đối
   */
  static fromNow(date: Date | string | number, baseDate?: Date | string | number): string {
    if (baseDate) {
      return DateUtils.dayjs(date).from(DateUtils.dayjs(baseDate));
    }
    return DateUtils.dayjs(date).fromNow();
  }

  /**
   * Kiểm tra xem ngày tháng có hợp lệ không
   * @param date Đối tượng Date, chuỗi ngày tháng, hoặc timestamp
   * @returns true nếu ngày tháng hợp lệ, ngược lại false
   */
  static isValid(date: Date | string | number): boolean {
    return DateUtils.dayjs(date).isValid();
  }

  /**
   * So sánh hai ngày tháng
   * @param date1 Ngày tháng thứ nhất
   * @param date2 Ngày tháng thứ hai
   * @returns 1 nếu date1 > date2, -1 nếu date1 < date2, 0 nếu bằng nhau
   */
  static compare(date1: Date | string | number, date2: Date | string | number): number {
    const d1 = DateUtils.dayjs(date1);
    const d2 = DateUtils.dayjs(date2);
    
    if (d1.isAfter(d2)) return 1;
    if (d1.isBefore(d2)) return -1;
    return 0;
  }

  /**
   * Tính khoảng cách giữa hai ngày tháng
   * @param date1 Ngày tháng thứ nhất
   * @param date2 Ngày tháng thứ hai (mặc định: thời gian hiện tại)
   * @param unit Đơn vị của khoảng cách (year, month, week, day, hour, minute, second, millisecond)
   * @param precise Nếu true sẽ trả về số thập phân, ngược lại trả về số nguyên
   * @returns Khoảng cách giữa hai ngày tháng theo đơn vị đã chọn
   */
  static diff(
    date1: Date | string | number, 
    date2?: Date | string | number, 
    unit: dayjs.OpUnitType = 'millisecond', 
    precise: boolean = false
  ): number {
    const d1 = DateUtils.dayjs(date1);
    const d2 = date2 ? DateUtils.dayjs(date2) : DateUtils.dayjs();
    
    return d1.diff(d2, unit, precise);
  }
}
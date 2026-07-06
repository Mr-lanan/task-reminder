// ============================================================
// 农历库（纯本地，1900-2100）
// 每个数字编码了该年的农历月信息：
// 低12位（bit0-bit11）：1-12月的大小（1=30天，0=29天）
// 高4位（bit12-bit15）：闰月月份（0=无闰月）
// ============================================================
const lunarInfo = [
  0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2, // 1900-1909
  0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977, // 1910-1919
  0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970, // 1920-1929
  0x06566, 0x0d4a0, 0x0ea50, 0x16e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950, // 1930-1939
  0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557, // 1940-1949
  0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0, // 1950-1959
  0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0, // 1960-1969
  0x096d0, 0x04ddb, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x195a6, // 1970-1979
  0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570, // 1980-1989
  0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x05ac0, 0x0ab60, 0x096d5, 0x092e0, // 1990-1999
  0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5, // 2000-2009
  0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930, // 2010-2019
  0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530, // 2020-2029
  0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45, // 2030-2039
  0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0, // 2040-2049
  0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50, 0x06b20, 0x1a6c4, 0x0aae0, // 2050-2059
  0x092e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0, 0x0a6d0, 0x055d4, // 2060-2069
  0x052d0, 0x0a9b8, 0x0aa50, 0x0b5a0, 0x0b6a6, 0x04ad0, 0x0a5b0, 0x0a5a4, 0x0a930, 0x07952, // 2070-2079
  0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530, 0x05aa0, // 2080-2089
  0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45, 0x0b5a0, // 2090-2099
  0x056d0                                                       // 2100
];

// ============================================================
// 农历转换核心
// ============================================================
export const LunarCalendar = {
  tianGan: ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'],
  diZhi: ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'],
  shengXiao: ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪'],
  monthNames: ['正','二','三','四','五','六','七','八','九','十','冬','腊'],

  getLunarMonthDays(year, month, isLeap) {
    if (isLeap) {
      const leapMonth = this.getLeapMonth(year);
      if (!leapMonth) return 0;
      return (lunarInfo[year - 1900] & 0x10000) ? 30 : 29;
    }
    return (lunarInfo[year - 1900] & (0x10000 >> month)) ? 30 : 29;
  },

  getLunarYearDays(year) {
    let sum = 348;
    const info = lunarInfo[year - 1900];
    for (let i = 0x8000; i > 0x8; i >>= 1) {
      sum += (info & i) ? 1 : 0;
    }
    return sum + this.getLeapDays(year);
  },

  getLeapMonth(year) {
    return lunarInfo[year - 1900] >> 12;
  },

  getLeapDays(year) {
    const leapMonth = this.getLeapMonth(year);
    if (leapMonth) {
      return (lunarInfo[year - 1900] & 0x10000) ? 30 : 29;
    }
    return 0;
  },

  solarToLunar(year, month, day) {
    if (year < 1900 || year > 2100) return null;
    const baseDate = new Date(1900, 0, 31);
    const targetDate = new Date(year, month - 1, day);
    let offset = Math.floor((targetDate - baseDate) / 86400000);
    if (offset < 0) return null;

    let lunarYear = 1900;
    let daysInLunarYear = this.getLunarYearDays(lunarYear);
    while (offset >= daysInLunarYear) {
      offset -= daysInLunarYear;
      lunarYear++;
      daysInLunarYear = this.getLunarYearDays(lunarYear);
    }

    let lunarMonth = 1;
    let isLeapMonth = false;
    const leapMonth = this.getLeapMonth(lunarYear);

    for (let i = 1; i <= 12; i++) {
      const monthDays = this.getLunarMonthDays(lunarYear, i, false);
      if (offset >= monthDays) {
        offset -= monthDays;
        if (leapMonth === i) {
          const leapDays = this.getLeapDays(lunarYear);
          if (offset >= leapDays) {
            offset -= leapDays;
            if (i === 12) { break; }
          } else {
            isLeapMonth = true;
            lunarMonth = i;
            break;
          }
        } else if (i === 12) {
          lunarMonth = 12;
        }
      } else {
        lunarMonth = i;
        break;
      }
    }

    // 修复边缘情况
    if (lunarMonth === 12 && offset >= this.getLunarMonthDays(lunarYear, 12, false)) {
      offset -= this.getLunarMonthDays(lunarYear, 12, false);
      if (leapMonth === 12) {
        const leapDays = this.getLeapDays(lunarYear);
        if (offset < leapDays) {
          isLeapMonth = true;
          lunarMonth = 12;
        } else {
          offset -= leapDays;
          lunarYear++;
          lunarMonth = 1;
        }
      } else {
        lunarYear++;
        lunarMonth = 1;
      }
    }

    const lunarDay = offset + 1;
    const totalDays = this.getLunarYearDays(lunarYear);
    const yearOffset = lunarYear - 1900;
    const ganIndex = (yearOffset + 9) % 10;
    const zhiIndex = (yearOffset + 1) % 12;
    const animalIndex = (yearOffset + 1) % 12;

    return {
      lunarYear,
      lunarMonth,
      lunarDay,
      isLeapMonth,
      monthName: this.monthNames[lunarMonth - 1] + (isLeapMonth ? '闰' : ''),
      dayName: this.getDayName(lunarDay),
      ganZhi: this.tianGan[ganIndex] + this.diZhi[zhiIndex],
      animal: this.shengXiao[animalIndex],
      totalDays
    };
  },

  getDayName(day) {
    const prefix = ['初','十','廿','三'];
    if (day === 10) return '初十';
    if (day === 20) return '二十';
    if (day === 30) return '三十';
    const tens = Math.floor(day / 10);
    const ones = day % 10;
    const numNames = ['','一','二','三','四','五','六','七','八','九','十'];
    if (day < 10) return '初' + numNames[day];
    if (day < 20) return '十' + numNames[day - 10];
    if (day < 30) return '廿' + numNames[day - 20];
    return '三十';
  },

  lunarToSolar(year, month, day, isLeap) {
    if (year < 1900 || year > 2100) return null;
    const baseDate = new Date(1900, 0, 31);
    let offset = 0;
    for (let y = 1900; y < year; y++) {
      offset += this.getLunarYearDays(y);
    }
    for (let m = 1; m < month; m++) {
      offset += this.getLunarMonthDays(year, m, false);
    }
    if (isLeap && this.getLeapMonth(year) === month) {
      offset += this.getLeapDays(year);
    }
    offset += day - 1;
    const resultDate = new Date(baseDate.getTime() + offset * 86400000);
    return {
      year: resultDate.getFullYear(),
      month: resultDate.getMonth() + 1,
      day: resultDate.getDate()
    };
  },

  nextLunarDate(lunarMonth, lunarDay, isLeapMonth, fromDate) {
    const from = new Date(fromDate);
    const fromYear = from.getFullYear();
    for (let year = fromYear; year <= 2100; year++) {
      const solar = this.lunarToSolar(year, lunarMonth, lunarDay, isLeapMonth);
      if (!solar) continue;
      const solarDate = new Date(solar.year, solar.month - 1, solar.day);
      if (solarDate >= from) {
        return { year: solar.year, month: solar.month, day: solar.day };
      }
    }
    return null;
  }
};

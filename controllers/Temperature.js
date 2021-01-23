const asyncHandler = require("../middlewares/async");
const ErrorResponse = require("../utils/errorResponse");
const Temperature = require("../models/Temperature");
const Excel = require("exceljs");
const moment = require("moment");

// @des GET ALL TEMPERATURE
// @route GET /api/temperature
// @access  Public
exports.getTemperatures = asyncHandler(async (req, res, next) => {
  try {
    const temperatures = await Temperature.find({});
    return res.status(200).json({ success: true, data: temperatures });
  } catch (error) {
    return next(new ErrorResponse(error, 400));
  }
});

// @desc    Create Temperature
// @route   POST /api/Temperature
// @access  Private/Admin
exports.createTemperature = asyncHandler(async (req, res, next) => {
  const temperature = await Temperature.create({
    ...req.body,
  });
  return res.status(201).json({ sucess: true, data: temperature });
});

// @desc    Get Temperature By Slug
// @route   GET /api/Temperature/:slug
// @access  Private/Admin
exports.getTemperatureById = asyncHandler(async (req, res, next) => {
  const slug = req.params.slug;
  try {
    const temperature = await Temperature.findOne(slug);
    return res.status(200).json({ success: true, data: temperature });
  } catch (error) {
    return next(new ErrorResponse(error, 404));
  }
});

// ====== Fliter ======

// @des     GET Filter Temperature
// @route   GET /api/temperature/search/by?
// @access  Private
exports.temperatureFilter = asyncHandler(async (req, res, next) => {
  const {
    year = null,
    fyear = null,
    eyear = null,
    fmonth = null,
    emonth = null,
  } = req.query;

  let query = {};
  if (year !== null) query.year = year;

  try {
    if (year && fmonth && emonth) {
      console.log("action year & month");
      const tempFilter = await Temperature.find(query);
      const resultTemp = tempFilter
        .reduce((acc, cur) => {
          return [
            ...acc,
            ...cur.temp.map((item) =>
              Object.assign(item, { year: cur.year }, { city: cur.city })
            ),
          ];
        }, [])
        .filter((value) => value.temp_id >= fmonth && value.temp_id <= emonth);
      return res.status(200).json({ success: true, data: resultTemp });
    } else if (year) {
      console.log("action 1");
      const temperature = await Temperature.find(query);
      const resultTemp = temperature.reduce((acc, cur) => {
        return [
          ...acc,
          ...cur.temp.map((item) =>
            Object.assign(item, { year: cur.year }, { city: cur.city })
          ),
        ];
      }, []);
      return res.status(200).json({ success: true, data: resultTemp });
    } else if (fyear && eyear) {
      console.log("action fyear & eyear");
      const temperatureFYear = await Temperature.find({
        year: {
          $gte: fyear,
          $lte: eyear,
        },
      });
      return res.status(200).json({ success: true, data: temperatureFYear });
    }
  } catch (error) {
    return next(new ErrorResponse(error, 404));
  }
});

// Excel
exports.moduleExcel = asyncHandler(async (req, res, next) => {
  const startDate = moment(new Date()).startOf("month").toDate();
  const endDate = moment(new Date()).endOf("month").toDate();
  try {
    const temper = await Temperature.find({
      created_at: { $gte: startDate, $lte: endDate },
    });
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet("My Temper");
    worksheet.columns = [
      { header: "Năm", key: "year", width: 12 },
      { header: "Thành phố, tỉnh", key: "city", width: 12 },
      { header: "Năm", key: "Năm", width: 12 },
    ];
    temper.forEach((value) => {
      worksheet.addRow(value);
    });
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
    });
    const data = await workbook.xlsx
      .writeFile("temper.xlsx")
      .then((res) => console.log("Done!"));
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

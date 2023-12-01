import { error } from "console";
import fs from "fs";
const path = require("path");

const create = (dir, structure, cb = null) => {
  cb = (
    (cb) =>
    (...a) =>
      setTimeout(() => cb.apply(null, a))
  )(cb);
  const subdirs = Reflect.ownKeys(structure);

  if (subdirs.length) {
    const sub = subdirs[0];
    const pth = path.join(dir, sub);
    const subsub = structure[sub];
    const copy = Object.assign({}, structure);
    delete copy[sub];

    fs.mkdir(pth, (err) => {
      if (err) return cb(err);
      create(pth, subsub, (err) => {
        if (err) return cb(err);
        create(dir, copy, cb);
      });
    });
  } else {
    cb(null);
  }
};

class FolderController {
  async createJob(job) {
    var isWin = process.platform === "win32";
    const filePath = isWin ? `\\\\gl-fs01\\GLIOrders\\` : `/Volumes/GLIOrders/`;
    const checkFilePath = isWin
      ? `\\\\gl-fs01\\GLIOrders\\${job}\\`
      : `/Volumes/GLIOrders/${job}/`;

    const structure = {
      [job]: {
        Contracts: {},
        Quality: {},
        Reports: {},
      },
    };

    if (!fs.existsSync(checkFilePath)) {
      await create(filePath, structure, (err) => {
        if (err) throw new Error(err);
        // else console.log("Success");
      });
    } else {
      throw new Error("Folder already exists");
    }
  }
  async createPart(partNumber) {
    var isWin = process.platform === "win32";
    const filePath = isWin ? `\\\\gl-fs01\\GLIParts\\` : `/Volumes/GLIParts/`;
    const checkFilePath = isWin
      ? `\\\\gl-fs01\\GLIParts\\${partNumber}\\`
      : `/Volumes/GLIParts/${partNumber}/`;

    const structure = {
      [partNumber]: {
        Current: {
          Art: {
            Approval: {},
            Automation: {},
            Customer: {},
            Cutting: {
              Dies: {},
              Laser: {},
              "Delta Laser": {},
              Plotter: {},
            },
            Documents: {},
            Film: {
              Face: {},
              Circuit: {},
            },
            DTS: {
              Face: {},
              Circuit: {},
            },
            Ref: {},
          },
          Cutting: {
            Laser: {},
            Zund: {},
          },
          Prints: {
            Image: {},
          },
          Quality: {
            Inspection: {
              FAIR: {
                "CMM File": {},
                Reports: {},
              },
              Production: {},
            },
            Planning: {
              "Customer Requirements": {},
              "Internal Quality Control": {},
            },
            Returns: {},
          },
        },
      },
    };

    if (!fs.existsSync(checkFilePath)) {
      await create(filePath, structure, (err) => {
        if (err) {
          throw new Error("Error in creating folders");
        }
        //  else console.log("Success");
      });
    } else {
      throw new Error("Folder already exists");
    }
  }
  async createArt(partNumber, res) {
    var isWin = process.platform === "win32";
    const filePath = isWin
      ? `\\\\gl-fs01\\GLIParts\\${partNumber}\\Current\\Art\\`
      : `/Volumes/GLIParts/${partNumber}/Current/Art/`;
    const checkFilePath = isWin
      ? `\\\\gl-fs01\\GLIParts\\${partNumber}\\`
      : `/Volumes/GLIParts/${partNumber}/`;

    const structure = {
      Approval: {},
      Automation: {},
      Customer: {},
      Cutting: {
        Dies: {},
        Laser: {},
        "Delta Laser": {},
        Plotter: {},
      },
      Documents: {},
      Film: {
        Face: {},
        Circuit: {},
      },
      DTS: {
        Face: {},
        Circuit: {},
      },
      Ref: {},
    };

    try {
      if (fs.existsSync(checkFilePath)) {
        await create(filePath, structure, (error) => {
          if (error) {
            console.log(error);
            // throw new Error("Error in creating folders");
            res.status(400).json({
              status: "Error",
              message: error.message,
              code: error.code,
            });
          }
          //  else console.log("Success");
          else {
            res.status(200).json({
              status: "success",
            });
          }
        });
      } else {
        // throw new Error("Folder not found!");
        res.status(400).json({
          status: "Error",
          message: "Folder not found!",
          code: error.code,
        });
      }
    } catch (error) {
      res.status(400).json({
        status: "Error",
        message: error.message,
        code: error.code,
      });
    }
  }
}

module.exports = new FolderController();

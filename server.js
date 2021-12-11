const express = require("express");
const app = express();
const PORT = 8000;
const Axios = require("axios");
const cheerio = require("cheerio");
const pretty = require("pretty");
const fs = require("fs");
const _ = require("lodash");

let linkArr = [];
let dataArr = [];
let data;

app.get("/", (req, res) => {
  Axios.get("https://docs.docker.com/get-started/overview/").then(
    async (response) => {
      const html = response.data;
      const $ = cheerio.load(html);
      $("h2").each((index, element) => {
        console.log($(element).text());
      });
    }
  );
});

app.get("/codeforces", (req, res) => {
  Axios.get("https://codeforces.com/problemset/page/3")
    .then(async (response) => {
      const html = response.data;
      const $ = cheerio.load(html);
      $("tbody tr .id a", html).each((index, element) => {
        linkArr.push("https://codeforces.com" + $(element).attr("href"));
      });
      for (let i = 0; i < linkArr.length; i++) {
        console.log(i);
        dataArr.push({});
        dataArr[i] = await Axios.get(linkArr[i])
          .then((response) => {
            let data = {};
            const html = response.data;
            const $ = cheerio.load(html);
            $(".problem-statement div", html).each((index, element) => {
              switch (index) {
                case 1:
                  data.name = $(element).text().slice(3, 10000);
                  data.question_id = _.kebabCase(
                    $(element).text().slice(3, 10000)
                  );
                  break;
                case 10:
                  data.question = $(element).text();
                  break;
                case 11:
                  data.input_details = $(element).text().slice(5, 10000);
                  break;
                case 13:
                  data.output_details = $(element).text().slice(6, 10000);
                  break;
                case 18:
                  data.sample_input = $(element).text().slice(5, 10000).trim();
                  break;
                case 20:
                  data.sample_output = $(element).text().slice(6, 10000).trim();
                  break;
                default:
                  break;
              }
            });
            data.tags = [];
            $(".roundbox .tag-box", html).each((index, element) => {
              data.tags.push($(element).text().trim());
            });
            return data;
          })
          .catch((err) => {
            console.log(err);
          });
      }
      console.log(dataArr);
      fs.writeFile("Codeforces3.json", JSON.stringify(dataArr), (err) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log("Successfully written data to file");
      });
      res.send(dataArr);
    })
    .catch((err) => {
      console.log(err);
    });
});
app.get("/codechef", async (req, res) => {
  let data = await Axios.get("https://codeforces.com/blog/entry/14565")
    .then((response) => {
      let tagsArr = [];
      const html = response.data;
      const $ = cheerio.load(html);
      $(".content ul li a", html).each((index, element) => {
        console.log($(element).text(), "Element");
        tagsArr.push({ tag: $(element).text() });
      });
      fs.writeFile("Tags.json", JSON.stringify(dataArr), (err) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log("Successfully written data to file");
      });
      return tagsArr;
    })
    .catch((err) => {
      console.log(err);
    });
  fs.writeFile("Tags.json", JSON.stringify(data), (err) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log("Successfully written data to file");
  });
  res.send(data);
});

app.listen(PORT, () => {
  console.log(`Server is live on port ${PORT}`);
});

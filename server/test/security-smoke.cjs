const assert = require("node:assert/strict");
const { createRequire } = require("node:module");
const path = require("node:path");
const fs = require("node:fs");
(async () => {
  const root = process.argv[2] || process.cwd(),
    r = createRequire(path.join(root, "package.json")),
    pkg = r("./package.json");
  const express = r("express"),
    app = express();
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.post("/form", (req, res) => res.json(req.body));
  app.get("/query", (req, res) => res.json(req.query));
  if (pkg.dependencies.multer) {
    const { saveImage } = r("./middleware/saveImage.js");
    app.post("/upload", saveImage, (req, res) => {
      assert.ok(req.file.size > 0);
      fs.unlinkSync(req.file.path);
      res.json({ name: req.file.originalname });
    });
  }
  const server = app.listen(0, "127.0.0.1");
  await new Promise((ok) => server.once("listening", ok));
  const url = `http://127.0.0.1:${server.address().port}`;
  try {
    let response = await fetch(url + "/form", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "user[name]=Ada&tags[]=one&tags[]=two&__proto__[polluted]=yes",
    });
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      user: { name: "Ada" },
      tags: ["one", "two"],
    });
    assert.equal({}.polluted, undefined);
    if (pkg.dependencies.multer) {
      const body = new FormData();
      body.append(
        "image",
        new Blob(["image fixture"], { type: "image/png" }),
        "fixture.png",
      );
      response = await fetch(url + "/upload", { method: "POST", body });
      assert.equal(response.status, 200);
      assert.equal((await response.json()).name, "fixture.png");
    }
    if (pkg.dependencies.jsonwebtoken) {
      const jwt = r("jsonwebtoken");
      assert.equal(
        jwt.verify(
          jwt.sign({ id: "fixture" }, "test-only-key"),
          "test-only-key",
        ).id,
        "fixture",
      );
    }
    if (pkg.dependencies.mongoose) {
      const mongoose = r("mongoose");
      const m = mongoose.model(
        "AuditFixture",
        new mongoose.Schema({ name: { type: String, required: true } }),
      );
      assert.ok(new m({}).validateSync());
      assert.equal(new m({ name: "fixture" }).validateSync(), undefined);
    }
    if (pkg.dependencies.nodemailer) {
      const transport = r("nodemailer").createTransport({
        jsonTransport: true,
      });
      const info = await transport.sendMail({
        from: "from@example.com",
        to: "to@example.com",
        subject: "offline fixture",
        text: "hello",
      });
      assert.equal(JSON.parse(info.message).subject, "offline fixture");
      transport.close();
    }
    if (pkg.dependencies.cloudinary) {
      const sdk = r("cloudinary").v2;
      assert.equal(typeof sdk.uploader.upload, "function");
      assert.match(
        sdk.url("fixture", { cloud_name: "demo", secure: true }),
        /^https:\/\/res.cloudinary.com\/demo\//,
      );
    }
    console.log(
      "PASS",
      root,
      "form parsing, prototype protection, installed integration APIs",
    );
  } finally {
    await new Promise((ok) => server.close(ok));
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

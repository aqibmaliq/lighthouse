/**
 * @license Copyright 2020 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
'use strict';

/* eslint-env jest */

const fs = require('fs');
const jsdom = require('jsdom');
const ElementScreenshotRenderer =
  require('../../../../report/html/renderer/element-screenshot-renderer.js');
const RectHelpers = require('../../../../../lighthouse-core/lib/rect-helpers.js');
const Util = require('../../../../report/html/renderer/util.js');
const I18n = require('../../../../report/html/renderer/i18n.js');
const DOM = require('../../../../report/html/renderer/dom.js');

const TEMPLATE_FILE = fs.readFileSync(
  __dirname + '/../../../../report/html/templates.html',
  'utf8'
);

describe('ElementScreenshotRenderer', () => {
  let dom;

  beforeAll(() => {
    global.RectHelpers = RectHelpers;
    global.Util = Util;
    global.Util.i18n = new I18n('en', {...Util.UIStrings});
    const {document} = new jsdom.JSDOM(TEMPLATE_FILE).window;
    dom = new DOM(document);
  });

  afterAll(() => {
    global.RectHelpers = undefined;
    global.Util.i18n = undefined;
    global.Util = undefined;
  });

  it('renders screenshot', () => {
    const fullPageScreenshot = {
      width: 1000,
      height: 1000,
    };
    const elementRectInScreenshotCoords = {
      left: 50,
      top: 50,
      width: 200,
      height: 300,
    };
    const renderContainerSizeInDisplayCoords = {
      width: 500,
      height: 500,
    };
    const el = ElementScreenshotRenderer.render(
      dom,
      dom.document(),
      fullPageScreenshot,
      elementRectInScreenshotCoords,
      renderContainerSizeInDisplayCoords
    );

    /* eslint-disable max-len */
    expect(el.innerHTML).toMatchInlineSnapshot(`
      "
          <div class=\\"lh-element-screenshot__content\\" style=\\"top: -500px;\\">
            <div class=\\"lh-element-screenshot__mask\\" style=\\"width: 500px; height: 500px; clip-path: url(#clip-0.1-0.7-0.1-0.5);\\"><div><svg height=\\"0\\" width=\\"0\\">
              <defs>
                <clipPath id=\\"clip-0.1-0.7-0.1-0.5\\" clipPathUnits=\\"objectBoundingBox\\">
                  <polygon points=\\"0,0  1,0  1,0.1 0,0.1\\"></polygon>
                  <polygon points=\\"0,0.7 1,0.7 1,1 0,1\\"></polygon>
                  <polygon points=\\"0,0.1 0.1,0.1 0.1,0.7 0,0.7\\"></polygon>
                  <polygon points=\\"0.5,0.1 1,0.1 1,0.7 0.5,0.7\\"></polygon>
                </clipPath>
              </defs>
            </svg></div></div>
            <div class=\\"lh-element-screenshot__image\\" style=\\"width: 500px; height: 500px; background-position-y: 0px; background-position-x: 0px; background-size: 1000px 1000px;\\"></div>
            <div class=\\"lh-element-screenshot__element-marker\\" style=\\"width: 200px; height: 300px; left: 50px; top: 50px;\\"></div>
          </div>
        "
    `);
    /* eslint-enable max-len */
  });

  describe('getScreenshotPositions', () => {
    it('centers the screenshot on the highlighted area', () => {
      expect(
        ElementScreenshotRenderer.getScreenshotPositions(
          {left: 400, top: 500, width: 100, height: 40},
          {width: 412, height: 300},
          {width: 1300, height: 5000}
        )
      ).toMatchObject({
        screenshot: {
          left: 244,
          top: 370,
        },
        clip: {
          left: 156,
          top: 130,
        },
      });
    });

    it('contains the screenshot within the display area if the clip is in the top left', () => {
      expect(
        ElementScreenshotRenderer.getScreenshotPositions(
          {left: 0, top: 0, width: 100, height: 40},
          {width: 412, height: 300},
          {width: 412, height: 5000}
        )
      ).toMatchObject({
        screenshot: {
          left: 0,
          top: 0,
        },
        clip: {
          left: 0,
          top: 0,
        },
      });
    });

    it('contains the screenshot within the display area if the clip is in the bottom right', () => {
      expect(
        ElementScreenshotRenderer.getScreenshotPositions(
          {left: 300, top: 4950, width: 100, height: 40},
          {width: 412, height: 300},
          {width: 412, height: 5000}
        )
      ).toMatchObject({
        screenshot: {
          left: 0,
          top: 4700,
        },
        clip: {
          left: 300,
          top: 250,
        },
      });

      expect(
        ElementScreenshotRenderer.getScreenshotPositions(
          {left: 300, top: 4950, width: 100, height: 40},
          {width: 200, height: 300},
          {width: 412, height: 5000}
        )
      ).toMatchObject({
        screenshot: {
          left: 212,
          top: 4700,
        },
        clip: {
          left: 88,
          top: 250,
        },
      });
    });
  });
});

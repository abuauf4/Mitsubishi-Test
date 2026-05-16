const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  PageBreak, Header, Footer, PageNumber, NumberFormat,
  AlignmentType, HeadingLevel, WidthType, BorderStyle, ShadingType,
  PageOrientation, TableOfContents, LevelFormat, SectionType,
} = require("docx");
const fs = require("fs");

// ── Palette: GO-1 Graphite Orange (PRD / Proposal) ──
const P = {
  primary: "1A2330",
  body: "000000",
  secondary: "506070",
  accent: "D4875A",
  surface: "F8F0EB",
  bg: "1A2330",
  cover: {
    titleColor: "FFFFFF",
    subtitleColor: "B0B8C0",
    metaColor: "90989F",
    footerColor: "687078",
  },
  table: {
    headerBg: "D4875A",
    headerText: "FFFFFF",
    accentLine: "D4875A",
    innerLine: "DDD0C8",
    surface: "F8F0EB",
  },
};

const c = (hex) => hex.replace("#", "");

// ── Border helpers ──
const NB = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: NB, bottom: NB, left: NB, right: NB };
const allNoBorders = { top: NB, bottom: NB, left: NB, right: NB, insideHorizontal: NB, insideVertical: NB };

// ── Title layout calculator ──
function calcTitleLayout(title, maxWidthTwips, preferredPt = 40, minPt = 24) {
  const charWidth = (pt) => pt * 20;
  const charsPerLine = (pt) => Math.floor(maxWidthTwips / charWidth(pt));
  let titlePt = preferredPt;
  let lines;
  while (titlePt >= minPt) {
    const cpl = charsPerLine(titlePt);
    if (cpl < 2) { titlePt -= 2; continue; }
    lines = splitTitleLines(title, cpl);
    if (lines.length <= 3) break;
    titlePt -= 2;
  }
  if (!lines || lines.length > 3) {
    const cpl = charsPerLine(minPt);
    lines = splitTitleLines(title, cpl);
    titlePt = minPt;
  }
  return { titlePt, titleLines: lines };
}

function splitTitleLines(title, charsPerLine) {
  if (title.length <= charsPerLine) return [title];
  const breakAfter = new Set([
    ..."\uFF0C\u3002\u3001\uFF1B\uFF1A\uFF01\uFF1F",
    ..."\u7684\u4E0E\u548C\u53CA\u4E4B\u5728\u4E8E\u4E3A",
    ..."-_\u2014\u2013\u00B7/",
    ..." \t",
  ]);
  const lines = [];
  let remaining = title;
  while (remaining.length > charsPerLine) {
    let breakAt = -1;
    for (let i = charsPerLine; i >= Math.floor(charsPerLine * 0.6); i--) {
      if (i < remaining.length && breakAfter.has(remaining[i - 1])) {
        breakAt = i; break;
      }
    }
    if (breakAt === -1) {
      const limit = Math.min(remaining.length, Math.ceil(charsPerLine * 1.3));
      for (let i = charsPerLine + 1; i < limit; i++) {
        if (breakAfter.has(remaining[i - 1])) { breakAt = i; break; }
      }
    }
    if (breakAt === -1) breakAt = charsPerLine;
    lines.push(remaining.slice(0, breakAt).trim());
    remaining = remaining.slice(breakAt).trim();
  }
  if (remaining) lines.push(remaining);
  if (lines.length > 1 && lines[lines.length - 1].length <= 2) {
    const last = lines.pop();
    lines[lines.length - 1] += last;
  }
  return lines;
}

function emptyPara() {
  return new Paragraph({ children: [] });
}

// ── Cover builder (R4 Top Color Block) ──
function buildCoverR4(config) {
  const padL = 1200, padR = 800;
  const availableWidth = 11906 - padL - padR;
  const { titlePt, titleLines } = calcTitleLayout(config.title, availableWidth, 40, 26);
  const titleSize = titlePt * 2;

  const titleBlockHeight = titleLines.length * (titlePt * 23 + 200);
  const englishLabelH = config.englishLabel ? (9 * 23 + 500) : 0;
  const subtitleH = config.subtitle ? (12 * 23 + 200) : 0;
  const upperContentH = englishLabelH + titleBlockHeight + subtitleH;
  const UPPER_MIN = 7500;
  const UPPER_H = Math.max(UPPER_MIN, upperContentH + 1500 + 800);
  const DIVIDER_H = 60;

  const contentEstimate =
    (config.englishLabel ? (9 * 23 + 500) : 0) +
    titleLines.length * (titlePt * 23 + 200) +
    (config.subtitle ? (12 * 23 + 200) : 0);
  const spacerIntrinsic = 280;
  const topSpacing = Math.max(UPPER_H - contentEstimate - spacerIntrinsic - 800, 400);

  const upperBlock = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: allNoBorders,
    rows: [new TableRow({
      height: { value: UPPER_H, rule: "exact" },
      children: [new TableCell({
        shading: { fill: P.bg }, borders: noBorders,
        verticalAlign: "top",
        margins: { left: padL, right: padR },
        children: [
          new Paragraph({ spacing: { before: topSpacing } }),
          config.englishLabel ? new Paragraph({
            spacing: { after: 500 },
            children: [new TextRun({ text: config.englishLabel.split("").join(" "),
              size: 18, color: P.accent, font: { ascii: "Calibri" }, characterSpacing: 60 })],
          }) : null,
          ...titleLines.map((line, i) => new Paragraph({
            spacing: { after: i < titleLines.length - 1 ? 100 : 200 },
            children: [new TextRun({ text: line, size: titleSize, bold: true,
              color: P.cover.titleColor, font: { eastAsia: "SimHei", ascii: "Arial" } })],
          })),
          config.subtitle ? new Paragraph({
            spacing: { after: 100 },
            children: [new TextRun({ text: config.subtitle, size: 24, color: P.cover.subtitleColor,
              font: { eastAsia: "Microsoft YaHei", ascii: "Arial" } })],
          }) : null,
        ].filter(Boolean),
      })],
    })],
  });

  const divider = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: allNoBorders,
    rows: [new TableRow({
      height: { value: DIVIDER_H, rule: "exact" },
      children: [new TableCell({ borders: noBorders,
        shading: { fill: P.accent }, children: [emptyPara()] })],
    })],
  });

  const lowerContent = [
    new Paragraph({ spacing: { before: 800 } }),
    ...(config.metaLines || []).map(line => new Paragraph({
      indent: { left: padL }, spacing: { after: 100 },
      children: [new TextRun({ text: line, size: 28, color: P.cover.metaColor,
        font: { eastAsia: "Microsoft YaHei", ascii: "Arial" } })],
    })),
    new Paragraph({ spacing: { before: 2000 } }),
    new Paragraph({
      indent: { left: padL },
      children: [
        new TextRun({ text: config.footerLeft || "", size: 22, color: "909090" }),
        new TextRun({ text: "          " }),
        new TextRun({ text: config.footerRight || "", size: 22, color: "909090" }),
      ],
    }),
  ];

  return [new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: allNoBorders,
    rows: [new TableRow({
      height: { value: 16838, rule: "exact" },
      children: [new TableCell({
        shading: { fill: "FFFFFF" }, borders: noBorders,
        verticalAlign: "top",
        children: [upperBlock, divider, ...lowerContent],
      })],
    })],
  })];
}

// ── Helpers ──
function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 160, line: 312 },
    children: [new TextRun({ text, bold: true, size: 32, color: c(P.primary),
      font: { ascii: "Times New Roman", eastAsia: "SimHei" } })],
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 120, line: 312 },
    children: [new TextRun({ text, bold: true, size: 28, color: c(P.primary),
      font: { ascii: "Times New Roman", eastAsia: "SimHei" } })],
  });
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 100, line: 312 },
    children: [new TextRun({ text, bold: true, size: 24, color: c(P.primary),
      font: { ascii: "Times New Roman", eastAsia: "SimHei" } })],
  });
}

function p(text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    indent: { firstLine: 480 },
    spacing: { line: 312, after: 60 },
    children: [new TextRun({ text, size: 24, color: c(P.body),
      font: { ascii: "Times New Roman", eastAsia: "Microsoft YaHei" } })],
  });
}

function pNoIndent(text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 312, after: 60 },
    children: [new TextRun({ text, size: 24, color: c(P.body),
      font: { ascii: "Times New Roman", eastAsia: "Microsoft YaHei" } })],
  });
}

function bulletItem(text, level = 0) {
  return new Paragraph({
    bullet: { level },
    spacing: { line: 312, after: 40 },
    children: [new TextRun({ text, size: 24, color: c(P.body),
      font: { ascii: "Times New Roman", eastAsia: "Microsoft YaHei" } })],
  });
}

function boldInline(label, text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    indent: { firstLine: 480 },
    spacing: { line: 312, after: 60 },
    children: [
      new TextRun({ text: label, bold: true, size: 24, color: c(P.primary),
        font: { ascii: "Times New Roman", eastAsia: "SimHei" } }),
      new TextRun({ text, size: 24, color: c(P.body),
        font: { ascii: "Times New Roman", eastAsia: "Microsoft YaHei" } }),
    ],
  });
}

// ── Table builder (Horizontal-Only business style) ──
function buildTable(headers, rows, colWidths) {
  const t = P.table;
  const hdrCellProps = (text, i) => new TableCell({
    children: [new Paragraph({ alignment: AlignmentType.CENTER,
      children: [new TextRun({ text, bold: true, size: 21, color: c(t.headerText),
        font: { ascii: "Times New Roman", eastAsia: "SimHei" } })] })],
    shading: { type: ShadingType.CLEAR, fill: c(t.headerBg) },
    margins: { top: 60, bottom: 60, left: 120, right: 120 },
    width: colWidths ? { size: colWidths[i], type: WidthType.PERCENTAGE } : undefined,
  });

  const dataCellProps = (text, i) => new TableCell({
    children: [new Paragraph({
      children: [new TextRun({ text, size: 21, color: c(P.body),
        font: { ascii: "Times New Roman", eastAsia: "Microsoft YaHei" } })] })],
    margins: { top: 60, bottom: 60, left: 120, right: 120 },
    width: colWidths ? { size: colWidths[i], type: WidthType.PERCENTAGE } : undefined,
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 2, color: c(t.accentLine) },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: c(t.accentLine) },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: c(t.innerLine) },
      insideVertical: { style: BorderStyle.NONE },
    },
    rows: [
      new TableRow({
        tableHeader: true,
        cantSplit: true,
        children: headers.map((h, i) => hdrCellProps(h, i)),
      }),
      ...rows.map(row => new TableRow({
        cantSplit: true,
        children: row.map((cell, i) => dataCellProps(cell, i)),
      })),
    ],
  });
}

function tableCaption(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 60, after: 200 },
    children: [new TextRun({ text, size: 18, color: c(P.secondary),
      font: { ascii: "Times New Roman", eastAsia: "Microsoft YaHei" } })],
  });
}

// ── Page layout constants ──
const pgSize = { width: 11906, height: 16838, orientation: PageOrientation.PORTRAIT };
const pgMargin = { top: 1440, bottom: 1440, left: 1701, right: 1417 };

// ── Build Document ──
const coverConfig = {
  title: "Mitsubishi Motor Indonesia\nWebsite Frontend PRD",
  subtitle: "Product Requirements Document \u2014 Frontend Specification",
  englishLabel: "PRODUCTREQUIREMENTS",
  metaLines: [
    "Project: Mitsubishi Motor Indonesia Sales Website",
    "Scope: Frontend Development",
    "Version: 1.0",
    "Date: May 2026",
  ],
  footerLeft: "Confidential",
  footerRight: "Mitsubishi Motor Indonesia",
  palette: P,
};

const doc = new Document({
  styles: {
    default: {
      document: {
        run: {
          font: { ascii: "Times New Roman", eastAsia: "Microsoft YaHei" },
          size: 24, color: c(P.body),
        },
        paragraph: {
          spacing: { line: 312 },
        },
      },
      heading1: {
        run: { font: { ascii: "Times New Roman", eastAsia: "SimHei" }, size: 32, bold: true, color: c(P.primary) },
        paragraph: { spacing: { before: 360, after: 160, line: 312 } },
      },
      heading2: {
        run: { font: { ascii: "Times New Roman", eastAsia: "SimHei" }, size: 28, bold: true, color: c(P.primary) },
        paragraph: { spacing: { before: 240, after: 120, line: 312 } },
      },
      heading3: {
        run: { font: { ascii: "Times New Roman", eastAsia: "SimHei" }, size: 24, bold: true, color: c(P.primary) },
        paragraph: { spacing: { before: 200, after: 100, line: 312 } },
      },
    },
  },
  numbering: {
    config: [
      {
        reference: "num-features",
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }],
      },
      {
        reference: "num-steps",
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }],
      },
      {
        reference: "num-routes",
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }],
      },
    ],
  },
  sections: [
    // ── Section 1: Cover ──
    {
      properties: {
        page: { size: pgSize, margin: { top: 0, bottom: 0, left: 0, right: 0 } },
      },
      children: buildCoverR4(coverConfig),
    },
    // ── Section 2: TOC ──
    {
      properties: {
        type: SectionType.NEXT_PAGE,
        page: {
          size: pgSize, margin: pgMargin,
          pageNumbers: { start: 1, formatType: NumberFormat.UPPER_ROMAN },
        },
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ children: [PageNumber.CURRENT], size: 18, color: "808080" })],
          })],
        }),
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({ text: "Mitsubishi Frontend PRD", size: 18, color: "808080" })],
          })],
        }),
      },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 480, after: 360 },
          children: [new TextRun({
            text: "Table of Contents",
            bold: true, size: 32,
            font: { eastAsia: "SimHei", ascii: "Times New Roman" },
          })],
        }),
        new TableOfContents("Table of Contents", {
          hyperlink: true,
          headingStyleRange: "1-3",
        }),
        new Paragraph({
          spacing: { before: 200 },
          children: [new TextRun({
            text: "Note: This Table of Contents is generated via field codes. To ensure page number accuracy after editing, please right-click the TOC and select \"Update Field.\"",
            italics: true, size: 18, color: "888888",
          })],
        }),
        new Paragraph({ children: [new PageBreak()] }),
      ],
    },
    // ── Section 3: Body ──
    {
      properties: {
        type: SectionType.NEXT_PAGE,
        page: {
          size: pgSize, margin: pgMargin,
          pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL },
        },
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ children: [PageNumber.CURRENT], size: 18, color: "808080" })],
          })],
        }),
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({ text: "Mitsubishi Frontend PRD", size: 18, color: "808080" })],
          })],
        }),
      },
      children: [
        // ═══════════════════════════════════════════════
        // 1. EXECUTIVE SUMMARY
        // ═══════════════════════════════════════════════
        h1("1. Executive Summary"),
        p("This Product Requirements Document (PRD) defines the frontend architecture, feature specifications, and design system for the Mitsubishi Motor Indonesia Sales Consultant Website. The platform serves as a digital showroom and lead-generation tool for Mitsubishi vehicle sales in the Indonesian market, targeting potential buyers of both passenger and commercial vehicles. The website is designed to function as a virtual sales consultant, guiding visitors from initial brand awareness through vehicle discovery, configuration, and ultimately to direct contact with a sales consultant via WhatsApp integration."),
        p("The frontend is built on Next.js 16 with the App Router pattern, leveraging React 19 Server Components for optimal performance, Tailwind CSS 4 for utility-first styling, and the shadcn/ui component library (New York style) for consistent, professional UI elements. The architecture follows a dual-accent theming system where Mitsubishi Red (#E60012) represents the passenger vehicle segment and FUSO Yellow (#FFD600) represents the commercial vehicle segment, creating a clear visual distinction that reinforces brand identity across all user touchpoints."),
        p("The website comprises three primary user-facing sections\u2014Home, Passenger, and Commercial\u2014supplemented by a comprehensive admin panel for content management. Key differentiating features include a BMW-style vehicle configurator with real-time color and variant selection, inline credit simulation calculators, a side-by-side vehicle comparison tool, and pervasive WhatsApp integration that ensures visitors can initiate a sales conversation from virtually any point in their browsing journey. The admin panel provides full CRUD operations for vehicles, testimonials, dealer locations, gallery content, hero sections, and site configuration, with advanced image handling including automatic background removal and transparency preservation."),

        // ═══════════════════════════════════════════════
        // 2. PROJECT OVERVIEW & OBJECTIVES
        // ═══════════════════════════════════════════════
        h1("2. Project Overview & Objectives"),

        h2("2.1 Project Vision"),
        p("The Mitsubishi Motor Indonesia Sales Website is designed to be the primary digital touchpoint for Indonesian consumers exploring Mitsubishi's vehicle lineup. Rather than serving as a corporate information portal, this website is purpose-built for selling cars\u2014every element, from the hero section to the vehicle configurator to the WhatsApp floating button, is optimized to move visitors through the sales funnel from awareness to consideration to action. The website replaces the traditional showroom brochure experience with an interactive, data-driven digital experience that can be accessed from any device, at any time."),
        p("The project encompasses eight passenger vehicles (Xpander, Xpander Cross, Pajero Sport, Destinator, Xforce, L100 EV, L300, Triton) and multiple commercial FUSO models (Canter series, Heavy Duty), each with detailed specifications, multiple color options, variant configurations, and pricing information. The frontend must present this extensive catalog in a manner that is both comprehensive and easily navigable, ensuring that visitors never feel overwhelmed by the breadth of options available."),

        h2("2.2 Target Audience"),
        p("The website targets two primary audience segments with distinct needs and browsing behaviors. The first segment consists of individual consumers and families in the Indonesian market who are considering purchasing a passenger vehicle for personal or family use. These visitors typically browse on mobile devices, compare multiple models, and value visual configuration tools and credit simulation features. The second segment comprises business owners, fleet managers, and logistics companies seeking commercial vehicles for goods transportation, construction, or delivery services. These visitors require detailed payload specifications, variant comparisons, and fleet solution information, and they often access the site from desktop devices during business hours."),
        p("Both segments share a common expectation: the ability to quickly find relevant information, configure their ideal vehicle, and connect with a sales consultant without friction. The WhatsApp integration serves as the primary conversion mechanism, reflecting the dominant role of WhatsApp in Indonesian business communication."),

        h2("2.3 Frontend Objectives"),
        bulletItem("Deliver an immersive, brand-aligned digital showroom experience that mirrors the premium feel of Mitsubishi's global branding while being tailored to the Indonesian market's preferences and communication habits."),
        bulletItem("Implement a vehicle configurator that allows visitors to select colors, variants, and view real-time image updates, creating a personalized exploration experience that increases engagement time and emotional connection with the product."),
        bulletItem("Provide comprehensive vehicle information architecture with detailed specifications, features, and pricing organized in intuitive tab-based layouts that prevent information overload while making all data easily accessible."),
        bulletItem("Integrate seamless conversion pathways (WhatsApp, test drive CTA, sales consultant contact) at multiple touchpoints throughout the user journey, ensuring that intent to purchase is captured at any stage of the funnel."),
        bulletItem("Build a responsive, mobile-first experience optimized for the Indonesian market where mobile internet usage dominates, with touch-friendly interactions, gesture support, and performance optimization for varying network conditions."),
        bulletItem("Establish a dual-accent visual theming system (Red for Passenger, Yellow for Commercial) that creates clear category distinction while maintaining cohesive brand identity across all pages and components."),

        // ═══════════════════════════════════════════════
        // 3. INFORMATION ARCHITECTURE
        // ═══════════════════════════════════════════════
        h1("3. Information Architecture"),

        h2("3.1 Page Routes & Navigation"),
        p("The website's information architecture follows a hub-and-spoke model centered on three primary entry points. The Home page serves as the brand introduction and gateway, directing visitors to either the Passenger or Commercial vehicle sections based on their intent. Each vehicle section provides a listing page that acts as a category hub, with individual vehicle detail pages serving as the primary conversion-focused pages where visitors spend the most time exploring configurations and specifications."),

        buildTable(
          ["Route", "Page Type", "Purpose"],
          [
            ["/", "Public", "Home \u2014 Brand introduction, vehicle gateway, social proof"],
            ["/passenger", "Public", "Passenger vehicle listing \u2014 Grid of all passenger cars"],
            ["/passenger/[slug]", "Public", "Vehicle detail \u2014 Configurator, specs, credit sim, compare"],
            ["/commercial", "Public", "Commercial vehicle listing \u2014 FUSO truck grid"],
            ["/commercial/[slug]", "Public", "Commercial vehicle detail \u2014 Same detail component, yellow accent"],
            ["/compare", "Public", "Vehicle comparison \u2014 Side-by-side up to 3 vehicles"],
            ["/admin", "Admin", "Dashboard \u2014 Stats overview, quick actions"],
            ["/admin/vehicles", "Admin", "Vehicle list \u2014 CRUD with category filter"],
            ["/admin/vehicles/[id]", "Admin", "Vehicle editor \u2014 5-tab form (Basic/Variant/Color/Spec/Feature)"],
            ["/admin/testimonials", "Admin", "Testimonial management \u2014 Star rating, CRUD"],
            ["/admin/dealers", "Admin", "Dealer location management \u2014 Maps integration"],
            ["/admin/gallery", "Admin", "Gallery management \u2014 Delivery photos & articles"],
            ["/admin/sales", "Admin", "Sales consultant profile editor"],
            ["/admin/site-config", "Admin", "Site configuration \u2014 Key-value store"],
            ["/admin/hero", "Admin", "Hero section editor \u2014 Per-page hero content"],
            ["/admin/categories", "Admin", "Audience category gateway cards"],
          ],
          [35, 12, 53]
        ),
        tableCaption("Table 1: Complete Route Map"),

        h2("3.2 Navigation Structure"),
        p("The primary navigation is implemented as a sticky navbar with three main sections: Home, Passenger, and Commercial. An announcement bar with a red marquee sits above the navigation, displaying promotional messages or important notices. The navigation includes a prominent WhatsApp CTA button that remains accessible from any page. On mobile devices, the navigation collapses into a full-screen slide-in menu (hamburger pattern) with the same link structure plus additional touch-friendly tap targets. A scroll progress bar (red gradient) provides visual feedback of page scroll position on all public pages."),
        p("The footer serves as a secondary navigation hub with five columns covering brand information, vehicle links, services, company information, and contact details. It includes a newsletter subscription form for email collection. Additionally, a floating WhatsApp button is persistently visible on desktop (bottom-right FAB) and a sticky bottom bar on mobile combining WhatsApp contact and a back-to-top button, ensuring conversion pathways are always within reach regardless of scroll position."),

        // ═══════════════════════════════════════════════
        // 4. FEATURE SPECIFICATIONS \u2014 PUBLIC PAGES
        // ═══════════════════════════════════════════════
        h1("4. Feature Specifications \u2014 Public Pages"),

        h2("4.1 Home Page"),
        p("The Home page is the primary landing experience designed to establish brand credibility, showcase the vehicle lineup, and funnel visitors toward their area of interest. It employs an immersive, full-width layout with parallax scrolling effects and staggered entrance animations powered by Framer Motion. The page is composed of distinct sections that flow naturally from brand introduction to product discovery to social proof to conversion."),

        h3("4.1.1 Hero Section"),
        p("The hero section occupies the full viewport on initial load with a background image dynamically loaded from the database (with static fallback). It features a parallax scroll effect where the background image moves at a slower rate than the foreground content, creating depth. The hero displays a dynamically configurable title and subtitle, along with a CTA button that can be configured per page via the admin panel. The hero data is fetched from the /api/hero endpoint with the page parameter set to 'home', and falls back to static content if the API is unavailable. The section uses AnimatePresence for smooth transitions when data loads asynchronously."),

        h3("4.1.2 Drive Your Ambition"),
        p("This section presents the Mitsubishi brand philosophy and tagline 'Drive Your Ambition' with a visually striking layout. It communicates the brand's heritage, innovation philosophy, and commitment to quality through a combination of bold typography and luxury design elements. The section uses glassmorphism effects (glass, glass-dark utility classes) and gradient borders to create visual depth, while Framer Motion handles scroll-triggered entrance animations with staggered timing across text elements."),

        h3("4.1.3 Audience Gateway"),
        p("The Audience Gateway is a critical conversion element consisting of two large, visually distinct cards\u2014one for Passenger vehicles and one for Commercial vehicles. Each card features a background image, title, description, and a link to the respective vehicle listing page. The cards use the card-shine animation effect (a sweeping light gradient on hover) and the appropriate accent color (red for passenger, yellow for commercial). This section is the primary funnel mechanism, directing visitors to their area of interest based on their vehicle needs. The gateway card content is managed through the admin panel's Audience Categories feature."),

        h3("4.1.4 Why Mitsubishi"),
        p("This section builds brand trust and credibility by highlighting Mitsubishi's heritage, manufacturing quality, and market presence in Indonesia. It uses a combination of statistics, brand story narrative, and visual elements to establish confidence in the brand before visitors explore specific vehicle models. The layout uses luxury dark card components with gold accents and shimmer text effects to convey premium quality."),

        h3("4.1.5 Gallery Section"),
        p("The gallery displays two types of content: delivery photos (customer vehicle handover images) and articles (blog-style content about Mitsubishi vehicles and events). Content is loaded from the /api/gallery endpoint and rendered in a responsive grid layout. Each gallery item includes an image, title, and optional description. The section uses the glass morphism card style with hover animations. Gallery content is fully manageable through the admin panel's Gallery management page, where items can be categorized as either delivery photos or articles."),

        h3("4.1.6 Testimonial Section"),
        p("Customer testimonials serve as social proof, displaying real customer experiences with star ratings (1-5), customer names, roles, and optional photos. The section uses a card-based carousel/grid layout with the glass-dark styling. Testimonials are loaded from the /api/testimonials endpoint and ordered by the displayOrder field set in the admin panel. Each testimonial card features the customer's star rating prominently displayed, the testimonial text, and the customer's identity. The section includes entrance animations with staggered timing for progressive reveal."),

        h3("4.1.7 Sales Consultant"),
        p("This section displays the sales consultant's profile card, including their name, title, phone number, WhatsApp contact, email, and photo. It serves as a direct conversion point, with a prominent WhatsApp CTA button that opens a pre-filled WhatsApp chat with the consultant. The sales consultant data is managed through a single-record editor in the admin panel, meaning the website showcases one primary sales consultant at a time. The card uses the luxury dark card styling with gold accents and glow effects."),

        h3("4.1.8 Promo & Test Drive CTA"),
        p("The promotional section highlights current offers and incentives, while the Test Drive CTA section provides a final, urgent conversion point with a bold call-to-action for booking a test drive. Both sections use the btn-mitsu-red button style with shine sweep animations and the glow-red effect to draw attention. The CTA links to WhatsApp with a pre-filled message requesting a test drive appointment."),

        h2("4.2 Passenger Vehicle Listing Page"),
        p("The Passenger page (/passenger) displays all passenger vehicles in a responsive grid layout. It features its own hero section (configured via admin panel for the 'passenger' page), a vehicle count statistic, and a newsletter subscription form. Each vehicle is rendered as a VehicleCard component displaying the vehicle image, name, tagline, starting price, key specifications (transmission, drivetrain), and a WhatsApp CTA button. The cards use the luxury dark card style with red accents and the card-shine-red hover effect. Vehicle data is loaded from the /api/vehicles endpoint filtered by category 'passenger' and ordered by displayOrder."),

        h2("4.3 Commercial Vehicle Listing Page"),
        p("The Commercial page (/commercial) mirrors the Passenger page structure but applies the FUSO Yellow accent theme throughout all components. It displays commercial vehicles (FUSO Canter series, Heavy Duty) in the same grid layout with VehicleCard components using yellow accents (badge-yellow, card-shine-yellow, btn-fuso-yellow). The hero section is independently configurable for the 'commercial' page. The page includes a Fleet Solution section highlighting FUSO's fleet management offerings, which is unique to the commercial segment."),

        h2("4.4 Vehicle Detail Page (Car Configurator)"),
        p("The Vehicle Detail page is the most feature-rich and conversion-critical page in the application. It implements a BMW-style car configurator experience where visitors can interactively explore a vehicle's colors, variants, and specifications. The page is accessed via dynamic routes (/passenger/[slug] or /commercial/[slug]) and uses the same VehicleDetailPage component with theming determined by the vehicle's category. The page is rendered as a Server Component that fetches vehicle data directly from the database, falling back to static data if the database is unavailable."),

        h3("4.4.1 Color Selector"),
        p("The color selector is the primary interactive element of the configurator. It displays all available vehicle colors as circular swatches along the bottom of the vehicle image area. When a color is selected, the main vehicle image updates to show the vehicle in the chosen color. Colors can be assigned globally (available for all variants) or to specific variants via the variantId field in the VehicleColor model. The selector supports both click and touch swipe/drag gestures for mobile devices, implemented with pointer event handlers that detect horizontal drag direction for cycling through colors. The active color swatch displays a ring highlight animation using Framer Motion's layoutId for smooth indicator transitions."),

        h3("4.4.2 Variant Selector"),
        p("The variant selector displays available vehicle variants (e.g., GLX Manual, GLS CVT, Exceed) as selectable chips or cards. Each variant shows its name, price, transmission type, and optional drivetrain information. When a variant is selected, the displayed price updates, the color selector filters to show only colors available for that variant (plus any global colors), and the specifications and features tabs update to reflect the selected variant. The variant data includes a highlights array that displays key selling points as badge elements. Variant selection also triggers a layout animation that smoothly transitions the content area."),

        h3("4.4.3 Content Tabs"),
        p("The vehicle detail page organizes information into six primary tabs, each designed to serve a different information need at different stages of the buyer's consideration journey. The Overview tab provides a high-level summary with the vehicle's tagline, highlight badges, and key selling points. The Detail tab breaks down features into four sub-categories (Eksterior, Interior, Keamanan, Performa) with tab switching. The Gallery tab displays exterior, interior, and highlight images in a responsive grid. The Specs tab presents detailed specifications organized by category (e.g., Engine, Dimensions, Safety) in a structured table format. The Credit Simulation tab provides an inline loan calculator tied to the selected variant's price. The Compare tab allows quick comparison with other vehicles."),

        h3("4.4.4 Credit Simulation"),
        p("The credit simulation component (CreditSimulation) is embedded within the vehicle detail page as one of the content tabs. It provides an interactive loan calculator that allows visitors to estimate their monthly payments based on the selected variant's price. The calculator includes a price slider (anchored to the variant's priceNum field), a down payment percentage selector, a tenor (loan duration) selection in months, and displays the calculated monthly payment. The component uses custom-styled range inputs with red gradient theming (custom CSS for the slider track and thumb). All calculations are performed client-side with no API dependency, ensuring instant feedback."),

        h3("4.4.5 Mitsubishi Connect & 360\u00B0 Preview"),
        p("For supported vehicles (currently the Destinator), the detail page displays Mitsubishi Connect information, showing available connected car features and their descriptions. This section is conditionally rendered based on the mitsubishiConnect field in the vehicle data. A 360-degree exterior view placeholder exists for future implementation, currently displaying a static image with a 'Coming Soon' indicator. The videoUrl field allows embedding a promotional video for each vehicle model."),

        h2("4.5 Vehicle Comparison Page"),
        p("The comparison page (/compare) enables visitors to compare up to three vehicles side-by-side across multiple dimensions: specifications (organized by category), features, highlight badges, available colors, and pricing. Visitors select vehicles using dropdown selectors, and the comparison table dynamically renders based on the selected vehicles' data. The comparison interface uses a responsive layout that adjusts the number of visible vehicles based on screen width. Specification categories are displayed as expandable sections with matching items aligned across vehicles for easy comparison. Color swatches are displayed per vehicle to show available color options side by side."),

        // ═══════════════════════════════════════════════
        // 5. FEATURE SPECIFICATIONS \u2014 ADMIN PANEL
        // ═══════════════════════════════════════════════
        h1("5. Feature Specifications \u2014 Admin Panel"),

        h2("5.1 Admin Dashboard"),
        p("The admin dashboard (/admin) provides an overview of the website's content state with live statistics cards showing the count of vehicles, testimonials, dealer locations, site configurations, categories, and hero sections. Each stat card includes a quick action link to the corresponding management page. The dashboard uses a grid layout with glassmorphism-styled cards. Data is fetched from the respective API endpoints on page load, with error handling that displays fallback counts of zero when the API is unavailable."),

        h2("5.2 Vehicle Management"),
        p("Vehicle management is the core admin feature, split into a list view (/admin/vehicles) and a detail editor (/admin/vehicles/[id]). The list view displays all vehicles in a table with category filtering, showing vehicle name, category, and counts of variants, colors, specs, and features. CRUD operations are available with confirmation dialogs for delete actions. The detail editor uses a 5-tab layout for organizing vehicle data into Basic Info, Variants, Colors, Specs, and Features sections."),

        h3("5.2.1 Basic Info Tab"),
        p("The Basic Info tab manages the vehicle's core attributes: name, slug (auto-generated from name), tagline, category selection (passenger/niaga-ringan/commercial), base price, payload description, short specs summary, and hero image upload. The image upload component (ImageUpload) supports both file upload (drag-and-drop) and URL input modes, with automatic white background removal using canvas flood-fill algorithm and transparency detection that preserves already-transparent PNGs. Images are stored in Vercel Blob Storage."),

        h3("5.2.2 Variants Tab"),
        p("The Variants tab manages vehicle variants with full CRUD operations. Each variant includes name, price (formatted string and numeric value), transmission type, drivetrain (optional), image, and highlights (JSON array of selling points). Variants can be reordered using up/down buttons that adjust the displayOrder field. The display order determines the sequence in which variants appear on the public vehicle detail page. Variant creation, updates, and deletion are handled through the /api/vehicles/[id]/variants API endpoint."),

        h3("5.2.3 Colors Tab"),
        p("The Colors tab manages vehicle colors with inline editing capabilities. Each color entry includes a name (e.g., 'White Diamond'), a hex color code (e.g., '#FFFFFF'), an optional variant assignment (colors can be global or specific to one variant), and an optional vehicle image in that color. Color names and hex values can be edited inline by clicking on the text, which transforms the display into an input field. Changes are saved on blur or Enter key press using the useRef pattern to track original values before editing. Colors can be reordered with up/down buttons, and each color supports independent image upload for the vehicle-in-color photo."),

        h3("5.2.4 Specs & Features Tabs"),
        p("The Specs tab manages specification categories (e.g., Mesin, Dimensi, Keselamatan) with items containing label-value pairs stored as JSON. The Features tab manages vehicle features with icon selection, title, and description fields. Both tabs support reordering via displayOrder and full CRUD operations through their respective API endpoints."),

        h2("5.3 Content Management"),
        p("Beyond vehicle management, the admin panel provides dedicated management pages for testimonials (with star rating UI), dealer locations (with Google Maps embed URL support), gallery items (delivery photos and articles), sales consultant profile (single-record editor), site configuration (key-value store with text/image/url types and page scoping), hero sections (per-page configuration with title, subtitle, CTA, and background image), and audience categories (gateway cards for the home page audience gateway section). All management pages follow a consistent design pattern with table-based listing, dialog-based forms for add/edit operations, and confirmation dialogs for delete actions."),

        h2("5.4 Image Handling System"),
        p("The admin panel includes a sophisticated image handling system designed specifically for vehicle showroom imagery. The ImageUpload component supports dual-mode input (file upload with drag-and-drop and URL input), automatic white background removal using a canvas flood-fill algorithm, transparency detection that skips background removal for already-transparent PNGs, format conversion (non-PNG images with detected transparency are converted to PNG), and Vercel Blob Storage integration for persistent image hosting. The component displays upload progress and preview thumbnails, and includes a transparency indicator badge when a transparent PNG is detected."),

        // ═══════════════════════════════════════════════
        // 6. UI/UX DESIGN SYSTEM
        // ═══════════════════════════════════════════════
        h1("6. UI/UX Design System"),

        h2("6.1 Brand Colors & Theming"),
        p("The design system is built on a dual-accent theming architecture that visually differentiates the passenger and commercial vehicle segments while maintaining a cohesive brand identity. The primary brand colors are Mitsubishi Red (#E60012) for the passenger segment and FUSO Yellow (#FFD600) for the commercial segment, with Obsidian Black (#0A0A0A) serving as the primary background and Gold (#C9A96E) providing luxury accent highlights. All theme colors are applied contextually based on the vehicle category or page section, with smooth transitions between themes when navigating across segments."),

        buildTable(
          ["Color Token", "Hex Value", "Usage"],
          [
            ["Mitsubishi Red", "#E60012", "Passenger accent, CTAs, navigation, badges"],
            ["FUSO Yellow", "#FFD600", "Commercial accent, CTAs, navigation, badges"],
            ["Obsidian Black", "#0A0A0A", "Primary background, dark sections"],
            ["Gold", "#C9A96E", "Luxury highlights, premium indicators"],
            ["White", "#FFFFFF", "Text on dark backgrounds, light sections"],
            ["Light Gray", "#F5F5F5", "Alternate row backgrounds, light cards"],
          ],
          [30, 20, 50]
        ),
        tableCaption("Table 2: Brand Color Palette"),

        h2("6.2 Typography"),
        p("The typography system uses three font families, each serving a specific role in the visual hierarchy. Geist Sans serves as the primary body font, providing a clean, modern appearance for all standard text. Geist Mono is used for code-like content, technical specifications, and data values. Playfair Display, a serif font, is used for headings and decorative text to introduce an element of luxury and sophistication appropriate for an automotive brand. All fonts are loaded via Next.js's built-in font optimization (next/font) for optimal performance."),

        h2("6.3 Visual Effects & CSS Classes"),
        p("The design system employs an extensive library of custom CSS utility classes (1400+ lines in globals.css) that create a premium, luxury automotive feel. These effects are organized into several categories that work together to establish visual depth and brand identity across all components and pages."),

        h3("6.3.1 Glassmorphism"),
        p("Glass morphism effects (glass, glass-dark, glass-light, glass-gold, glass-red, glass-yellow) create translucent card backgrounds with backdrop blur, subtle borders, and layered shadows. These effects are used extensively on vehicle cards, section containers, and overlay elements to create depth against the dark backgrounds."),

        h3("6.3.2 Glow & Shine Effects"),
        p("Glow effects (glow-red, glow-gold, glow-green, glow-yellow with hover variants) add colored box-shadows to interactive elements. Card shine effects (card-shine, card-shine-red, card-shine-yellow) create a sweeping light gradient animation on hover, simulating a light reflection across the card surface. Shimmer text effects (text-gold-shimmer, text-red-shimmer, text-yellow-shimmer) apply animated gradient text colors for headings and labels."),

        h3("6.3.3 Button Styles"),
        p("Three primary button styles correspond to the brand segments: btn-luxury (gold gradient with shine sweep for premium CTAs), btn-mitsu-red (red gradient with shine sweep for passenger CTAs), and btn-fuso-yellow (yellow gradient with shine sweep for commercial CTAs). All buttons include hover states with enhanced glow effects and smooth transitions."),

        h3("6.3.4 Background Patterns"),
        p("Vehicle image containers use specialized background patterns (vehicle-image-bg, vehicle-image-bg-yellow, vehicle-image-bg-light) inspired by BMW's configurator design, featuring subtle dot patterns or gradient backgrounds that make vehicle images stand out without competing for visual attention. Additional patterns include diagonal lines, crosshatch, diamond, and grid patterns in both dark and light variants, with red and yellow theme variants."),

        h2("6.4 Animation System"),
        p("Framer Motion is the primary animation library, used throughout the application for page transitions, scroll-triggered animations, layout animations, and staggered entrance effects. Key animation patterns include: page-level transitions using AnimatePresence, scroll-triggered fade-in/slide-up animations on section components, layoutId-based smooth transitions for active tab indicators and color selector rings, staggered card entrance animations with increasing delay per card, spring physics for navigation indicator movements, and parallax scrolling effects on hero sections. Animation parameters follow a consistent pattern with spring configurations (stiffness: 300, damping: 30) for interactive elements and ease-out curves for entrance animations."),

        h2("6.5 Responsive Design"),
        p("The website follows a mobile-first responsive design philosophy, optimized for the Indonesian market where mobile internet usage dominates. Breakpoints use Tailwind CSS's standard scale (sm: 640px, md: 768px, lg: 1024px). All interactive elements maintain a minimum touch target size of 44px (min-h-[44px]) for mobile usability. The navigation transforms from a sticky desktop navbar to a full-screen mobile slide-in menu. The floating WhatsApp button changes from a desktop FAB (bottom-right) to a mobile sticky bottom bar with WhatsApp + back-to-top. Vehicle color selection supports touch swipe/drag gestures. The admin sidebar collapses into a mobile drawer. Safe area insets (safe-bottom) are used for mobile bottom bars to accommodate notched devices."),

        // ═══════════════════════════════════════════════
        // 7. TECHNICAL ARCHITECTURE
        // ═══════════════════════════════════════════════
        h1("7. Technical Architecture (Frontend)"),

        h2("7.1 Technology Stack"),
        buildTable(
          ["Technology", "Version", "Role"],
          [
            ["Next.js", "16", "Full-stack React framework with App Router"],
            ["React", "19", "UI library with Server Components"],
            ["TypeScript", "5.x", "Type-safe development"],
            ["Tailwind CSS", "4", "Utility-first CSS framework"],
            ["shadcn/ui", "New York", "Component library (50+ components)"],
            ["Framer Motion", "11.x", "Animation and gesture library"],
            ["Zustand", "5.x", "State management (available, local state used currently)"],
            ["React Query", "5.x", "Server state management (available)"],
            ["React Hook Form + Zod", "Latest", "Form handling and validation"],
            ["Bun", "Latest", "JavaScript runtime and package manager"],
          ],
          [30, 18, 52]
        ),
        tableCaption("Table 3: Technology Stack"),

        h2("7.2 Rendering Strategy"),
        p("The application uses a hybrid rendering strategy optimized for both performance and data freshness. All public pages use force-dynamic rendering, ensuring that content is always served fresh from the database. Server Components are used as the primary data-fetching mechanism, accessing the database directly without API route overhead. The vehicle detail pages implement generateStaticParams for build-time route generation, but with force-dynamic override for runtime data freshness. Client Components are used only where interactivity is required (color selectors, variant switchers, credit calculators, admin forms), minimizing the client-side JavaScript bundle."),
        p("The dual data source architecture (Turso database primary + static TypeScript data fallback) ensures the website remains functional even when the database is unavailable. Server Components first attempt to fetch from the database, and if the connection fails, they gracefully fall back to the static vehicle data defined in src/data/vehicles.ts. This resilience pattern is critical for maintaining uptime in production environments."),

        h2("7.3 Component Architecture"),
        p("The component architecture follows a clear separation between Server Components (data-fetching, layout) and Client Components (interactivity, state management). Each page route is a Server Component that fetches data and passes it as props to Client Components. The VehicleDetailPage is the largest Client Component, handling color selection, variant switching, tab navigation, and credit simulation state. The admin panel exclusively uses Client Components for form interactions, with data mutations handled through API routes using the fetch API with revalidation patterns."),
        p("Shared components (PageHero, VehicleCard, Breadcrumb) are designed for reuse across passenger and commercial pages, accepting theme-related props to apply the appropriate accent color. The shadcn/ui component library provides 50+ pre-built components (dialogs, tables, forms, tabs, etc.) that are customized through Tailwind CSS utility classes and the project's design token system."),

        h2("7.4 Data Flow"),
        p("Public pages follow a unidirectional data flow: Server Component fetches data from Turso DB (or static fallback) and passes it as props to Client Components. Client Components manage local UI state (selected color, active tab, etc.) and do not require global state management for most interactions. Admin pages use a different pattern: Client Components fetch data from API routes on mount, display it in forms, and submit mutations back to API routes, which update the database and trigger page revalidation. The API layer follows RESTful conventions with dedicated endpoints for each entity type and HTTP method-based CRUD operations."),

        // ═══════════════════════════════════════════════
        // 8. API INTEGRATION POINTS
        // ═══════════════════════════════════════════════
        h1("8. API Integration Points"),

        h2("8.1 Public API Endpoints"),
        p("The frontend interacts with a set of public API endpoints that provide read-only access to the website's content data. These endpoints are used by Server Components for direct database access during server-side rendering, and by Client Components for dynamic content updates without full page reloads. All public endpoints return JSON responses with error handling that returns empty arrays or fallback data when the database is unavailable."),

        buildTable(
          ["Endpoint", "Method", "Description"],
          [
            ["/api/vehicles", "GET", "List all active vehicles with variants, colors, specs"],
            ["/api/hero?page=X", "GET", "Hero section data for specified page"],
            ["/api/testimonials", "GET", "Active testimonials ordered by displayOrder"],
            ["/api/gallery", "GET", "Gallery items (delivery photos & articles)"],
            ["/api/sales", "GET", "Sales consultant profile data"],
            ["/api/dealer-locations", "GET", "Active dealer locations with maps data"],
            ["/api/site-config", "GET", "Site configuration key-value pairs"],
            ["/api/audience-categories", "GET", "Audience gateway category cards"],
          ],
          [35, 12, 53]
        ),
        tableCaption("Table 4: Public API Endpoints"),

        h2("8.2 Admin API Endpoints"),
        p("Admin API endpoints provide full CRUD operations for all content entities. These endpoints are prefixed with /api/admin/ and follow RESTful patterns with PUT for updates, POST for creation, and DELETE for removal. All admin endpoints include validation and error handling with descriptive error messages returned in the response body. The vehicle management endpoints support nested resources (variants, colors, specs, features) under the /api/admin/vehicles/[id] path, with dedicated sub-endpoints for each resource type."),

        h2("8.3 Image Handling API"),
        p("Image uploads are handled through the Vercel Blob Storage integration. The ImageUpload component uploads files directly to Vercel Blob and stores the resulting URL in the database. An image proxy route (/api/image) exists for serving images from Vercel Blob, handling both public and private blob URLs. The proxy detects image format (PNG vs JPEG) via magic byte inspection to preserve transparency. Current optimization work involves transitioning from proxied image delivery to direct public Blob CDN URLs to reduce bandwidth consumption and eliminate the double data transfer overhead of the proxy architecture."),

        // ═══════════════════════════════════════════════
        // 9. PERFORMANCE & OPTIMIZATION
        // ═══════════════════════════════════════════════
        h1("9. Performance & Optimization Requirements"),

        h2("9.1 Core Web Vitals Targets"),
        p("The frontend must meet the following Core Web Vitals performance targets to ensure optimal user experience and search engine ranking. Largest Contentful Paint (LCP) should be under 2.5 seconds, achieved through Server Component rendering, optimized image delivery via Vercel Blob CDN, and lazy loading of below-fold content. First Input Delay (FID) should be under 100 milliseconds, supported by minimal client-side JavaScript through Server Component architecture and code splitting. Cumulative Layout Shift (CLS) should be under 0.1, enforced by explicit image dimensions, reserved space for dynamic content, and stable layout containers for animated elements."),

        h2("9.2 Image Optimization"),
        p("Images are a critical performance factor for an automotive showroom website. All vehicle images must be served with appropriate sizing and format optimization. The Next.js Image component is used with the unoptimized prop for Blob-sourced images (required due to cross-origin constraints), with explicit width and height attributes to prevent layout shift. The image proxy system is being optimized to serve images directly from Vercel Blob's CDN rather than through a serverless proxy, which will halve the bandwidth cost per image request. Automatic background removal is performed client-side during upload (canvas-based), avoiding server processing overhead."),

        h2("9.3 Bundle Optimization"),
        p("Client-side JavaScript bundle size must be minimized through Server Component architecture (reducing client-side code), dynamic imports for heavy components (Framer Motion animations, chart libraries), tree-shaking of unused shadcn/ui components, and route-based code splitting (automatic with Next.js App Router). The application uses force-dynamic rendering for data freshness, but generateStaticParams ensures route generation efficiency at build time."),

        // ═══════════════════════════════════════════════
        // 10. ROADMAP & PRIORITIES
        // ═══════════════════════════════════════════════
        h1("10. Roadmap & Priorities"),

        h2("10.1 Current State (v1.0)"),
        p("The current implementation includes the complete public-facing website with Home, Passenger, Commercial, Vehicle Detail, and Comparison pages, all with the dual-accent theming system and luxury design effects. The admin panel provides full content management for vehicles (5-tab editor with inline editing), testimonials, dealers, gallery, sales consultant, site configuration, hero sections, and audience categories. Image handling with background removal and transparency preservation is implemented. WhatsApp integration is active across all conversion touchpoints. The credit simulation calculator is functional within vehicle detail pages."),

        h2("10.2 High Priority (v1.1)"),
        bulletItem("Optimize Vercel Blob image delivery: switch from proxied to direct public CDN URLs to reduce bandwidth consumption and eliminate double data transfer."),
        bulletItem("Implement admin authentication and authorization to protect admin panel routes and API endpoints."),
        bulletItem("Create /api/vehicles/[slug] endpoint for optimized vehicle data fetching by slug instead of ID."),
        bulletItem("Add error boundaries at the component level to prevent cascade failures from individual section errors."),
        bulletItem("Fix ignoreBuildErrors configuration for production build reliability."),

        h2("10.3 Medium Priority (v1.2)"),
        bulletItem("Implement per-vehicle promotional content management in the admin panel, allowing sales-specific offers per model."),
        bulletItem("Add Berita/Artikel (news/articles) per vehicle model, managed through the admin panel with rich text editing."),
        bulletItem("Build a Bandingkan Kendaraan (Compare Vehicles) enhancement with more detailed specification comparison and feature matrix."),
        bulletItem("Implement multi-select variant assignment for colors in admin panel, allowing a single color to be assigned to multiple variants simultaneously."),

        h2("10.4 Low Priority (v2.0)"),
        bulletItem("360-degree exterior view integration for vehicle configurator, replacing the current placeholder."),
        bulletItem("Mitsubishi Connect live feature demonstration for supported vehicles."),
        bulletItem("Newsletter system with email collection and subscriber management."),
        bulletItem("Video Hero per model with embedded promotional videos in the hero section."),
        bulletItem("Progressive Web App (PWA) support for offline vehicle browsing and push notifications."),

        // ═══════════════════════════════════════════════
        // 11. DATA MODELS
        // ═══════════════════════════════════════════════
        h1("11. Appendix: Core Data Models"),

        h2("11.1 Vehicle Data Structure"),
        p("The Vehicle data model is the central entity of the application, connecting variants, colors, specifications, and features into a comprehensive product representation. Each vehicle belongs to a category (passenger, niaga-ringan, or commercial) and contains all the information needed to render both the listing card and the detail configurator page."),

        buildTable(
          ["Field", "Type", "Description"],
          [
            ["slug", "string", "URL-friendly unique identifier (e.g., 'xpander-cross')"],
            ["name", "string", "Display name (e.g., 'Xpander Cross')"],
            ["tagline", "string", "Marketing tagline displayed on cards and detail page"],
            ["category", "enum", "'passenger' | 'niaga-ringan' | 'commercial'"],
            ["basePrice", "string", "Formatted starting price (e.g., 'Rp 289.000.000')"],
            ["imagePath", "string", "Hero image URL from Vercel Blob Storage"],
            ["colors", "VehicleColor[]", "Available colors with images and variant assignments"],
            ["variants", "VehicleVariant[]", "Model variants with pricing and specifications"],
            ["specs", "VehicleSpec[]", "Technical specifications by category"],
            ["features", "VehicleFeature[]", "Feature highlights with icons and descriptions"],
            ["highlightBadges", "Badge[]", "Key selling point badges (e.g., '7-Seater')"],
            ["gallery", "VehicleGallery", "Organized images: exterior, interior, highlights"],
            ["displayOrder", "number", "Sort order for listing page position"],
            ["active", "boolean", "Visibility toggle for published/draft state"],
          ],
          [22, 22, 56]
        ),
        tableCaption("Table 5: Vehicle Data Model Fields"),

        h2("11.2 VehicleColor Data Structure"),
        buildTable(
          ["Field", "Type", "Description"],
          [
            ["name", "string", "Color display name (e.g., 'White Diamond')"],
            ["hex", "string", "Hex color code (e.g., '#FFFFFF')"],
            ["imagePath", "string?", "Vehicle image in this color (Vercel Blob URL)"],
            ["variantId", "string?", "Assigned variant ID (null = global for all variants)"],
            ["displayOrder", "number", "Sort order in color selector"],
          ],
          [22, 18, 60]
        ),
        tableCaption("Table 6: VehicleColor Data Model"),

        h2("11.3 VehicleVariant Data Structure"),
        buildTable(
          ["Field", "Type", "Description"],
          [
            ["name", "string", "Variant name (e.g., 'GLS CVT')"],
            ["price", "string", "Formatted price (e.g., 'Rp 329.000.000')"],
            ["priceNum", "number", "Numeric price for calculations and sorting"],
            ["transmission", "string", "Transmission type (e.g., 'CVT', 'Manual')"],
            ["drivetrain", "string?", "Drivetrain info (e.g., 'RWD', '4WD')"],
            ["imagePath", "string?", "Variant-specific image"],
            ["highlights", "string[]", "JSON array of variant selling points"],
            ["displayOrder", "number", "Sort order in variant selector"],
          ],
          [22, 18, 60]
        ),
        tableCaption("Table 7: VehicleVariant Data Model"),
      ],
    },
  ],
});

// ── Generate ──
const OUTPUT_PATH = "/home/z/my-project/download/Mitsubishi_Frontend_PRD.docx";
Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(OUTPUT_PATH, buf);
  console.log("PRD generated:", OUTPUT_PATH);
});

import type { StructureResolver } from "sanity/structure";

export const structure: StructureResolver = (S) =>
  S.list()
    .title("iPhone Store 后台")
    .items([
      S.listItem()
        .title("盲盒设置")
        .child(
          S.document()
            .schemaType("blindBoxConfig")
            .documentId("blindBoxConfig"),
        ),
      S.listItem()
        .title("全站设置 & SEO")
        .child(
          S.document()
            .schemaType("siteSettings")
            .documentId("siteSettings"),
        ),
      S.divider(),
      S.documentTypeListItem("blindBoxPrize").title("盲盒奖品 & 概率"),
      S.documentTypeListItem("product").title("产品管理"),
    ]);

import { superTokensNextWrapper } from "supertokens-node/nextjs";
import { verifySession } from "supertokens-node/recipe/session/framework/express";
import supertokens from "supertokens-node";
import { backendConfig } from "@/config/backendConfig";
import { NextApiRequest, NextApiResponse } from "next";
import { SessionRequest } from "supertokens-node/framework/express";
import { Response } from "express";
import { prisma } from "@/db/prisma";
import { Prisma } from "@prisma/client";
import { logger as _logger } from "@/config/logger";

supertokens.init(backendConfig());

export interface IOrganizations {
  organization?: Prisma.OrganizationGetPayload<{}>;
  error?:
    | "INTERNAL_SERVER_ERROR"
    | "METHOD_NOT_ALLOWED"
    | "FORBIDDEN"
    | "NOT_FOUND";
}

export default async function organizations(
  req: NextApiRequest & SessionRequest,
  res: NextApiResponse & Response
) {
  const logger = _logger.child({
    endpoint: `/organizations/${req.query.id}`,
    method: req.method,
    query: req.query,
    cookie: req.headers.cookie,
    body: req.body,
  });

  logger.info("accessed endpoint");

  await superTokensNextWrapper(
    async (next) => {
      return await verifySession()(req, res, next);
    },
    req,
    res
  );

  const { id } = req.query;

  const user = await prisma.user
    .findUnique({
      where: { authId: req.session.getUserId() },
    })
    .catch((err) => logger.error(err));

  if (!user) return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });

  switch (req.method) {
    case "GET":
      let organization;
      try {
        organization = await prisma.organization.findUnique({
          where: { id: id as string },
        });
      } catch (err) {
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === "P2025"
        )
          return res.status(404).json({ error: "NOT_FOUND" });

        logger.error(err);
        return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
      }

      return res.status(200).json({ organization });

    case "POST":
      if (user.role !== "ADMIN")
        return res.status(403).json({ error: "FORBIDDEN" });

      const newOrg = await prisma.organization
        .create({ data: req.body })
        .catch((err) => logger.error(err));

      if (!newOrg)
        return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });

      return res.status(200).json({ organization: newOrg });

    case "DELETE":
      if (user.role !== "ADMIN")
        return res.status(403).json({ error: "FORBIDDEN" });

      const deletedOrg = await prisma.organization
        .delete({ where: { id: id as string } })
        .catch((err) => logger.error(err));

      if (!deletedOrg)
        return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });

      return res.status(200).json({ organization: deletedOrg });

    default:
      return res.status(405).json({ error: "METHOD_NOT_ALLOWED" });
  }
}

import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Moniruzzaman Mahdi — Full Stack Developer";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  let avatarBase64 = "";
  try {
    const avatarPath = join(process.cwd(), "public", "Moniruzzaman_Mahdi.png");
    const avatarBuffer = await readFile(avatarPath);
    avatarBase64 = `data:image/png;base64,${avatarBuffer.toString("base64")}`;
  } catch (error) {
    console.error("Error reading avatar image for OpenGraph:", error);
  }

  return new ImageResponse(
    (
      <div
        style={{
          background: "#050505",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "50px 70px",
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        {/* Subtle background ambient glow */}
        <div
          style={{
            position: "absolute",
            top: "-120px",
            right: "-80px",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0, 242, 254, 0.16) 0%, rgba(112, 0, 255, 0.08) 50%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-100px",
            left: "-50px",
            width: "450px",
            height: "450px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255, 255, 255, 0.05) 0%, transparent 70%)",
          }}
        />

        {/* Top Header Row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
            paddingBottom: "20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <span
              style={{
                color: "#ffffff",
                fontSize: "34px",
                fontWeight: 900,
                letterSpacing: "-0.05em",
              }}
            >
              MAHDI
            </span>
            <span
              style={{
                color: "#a1a1aa",
                fontSize: "15px",
                fontWeight: 600,
                marginLeft: "4px",
                marginTop: "-14px",
              }}
            >
              ®
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "7px 16px",
              borderRadius: "999px",
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#4ade80",
              }}
            />
            <span
              style={{
                color: "#e4e4e7",
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}
            >
              Available For Work
            </span>
          </div>
        </div>

        {/* Middle Core Statement + Right Side Circle Image */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            gap: "40px",
            margin: "auto 0",
          }}
        >
          {/* Left Text Column */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              flex: 1,
              maxWidth: "700px",
            }}
          >
            <div
              style={{
                color: "#a1a1aa",
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "0.25em",
                textTransform: "uppercase",
              }}
            >
              // FULL STACK DEVELOPER & SOFTWARE ENGINEER
            </div>

            <div
              style={{
                color: "#ffffff",
                fontSize: "66px",
                fontWeight: 900,
                lineHeight: 0.95,
                letterSpacing: "-0.04em",
                textTransform: "uppercase",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <span>DRIVEN</span>
              <span style={{ color: "#71717a" }}>BY LOGIC</span>
            </div>

            <p
              style={{
                color: "#d4d4d8",
                fontSize: "18px",
                lineHeight: 1.45,
                margin: 0,
              }}
            >
              Building robust architectures, automating the complex, and transforming static systems into intelligent digital platforms.
            </p>
          </div>

          {/* Right Avatar Column with Glowing Circular Frame */}
          {avatarBase64 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                width: "270px",
                height: "270px",
                flexShrink: 0,
              }}
            >
              {/* Outer decorative ring */}
              <div
                style={{
                  position: "absolute",
                  width: "270px",
                  height: "270px",
                  borderRadius: "50%",
                  padding: "4px",
                  background:
                    "linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(0, 242, 254, 0.7) 50%, rgba(112, 0, 255, 0.7) 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 40px rgba(0, 242, 254, 0.25)",
                }}
              >
                <div
                  style={{
                    width: "262px",
                    height: "262px",
                    borderRadius: "50%",
                    background: "#0a0a0f",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={avatarBase64}
                    alt="Moniruzzaman Mahdi"
                    width={262}
                    height={262}
                    style={{
                      width: "262px",
                      height: "262px",
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Tech Bar & URL */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            borderTop: "1px solid rgba(255, 255, 255, 0.12)",
            paddingTop: "18px",
          }}
        >
          <div style={{ display: "flex", gap: "8px" }}>
            {["Next.js", "TypeScript", "React", "Node.js", "PostgreSQL", "Docker"].map((tech) => (
              <span
                key={tech}
                style={{
                  color: "#d4d4d8",
                  fontSize: "12px",
                  fontWeight: 600,
                  padding: "5px 12px",
                  borderRadius: "999px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                {tech}
              </span>
            ))}
          </div>

          <span
            style={{
              color: "#a1a1aa",
              fontSize: "14px",
              fontWeight: 700,
              letterSpacing: "0.1em",
            }}
          >
            mahdimonir.dev
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

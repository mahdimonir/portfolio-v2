import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import db from "@/lib/portfolio-db.json";

export const alt = "Moniruzzaman Mahdi — Full Stack Developer";
export const size = {
    width: 1200,
    height: 630,
};
export const dynamic = "force-dynamic";
export const revalidate = 0;
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
        <div
            style={{
                background: "#000000",
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: "54px 70px",
                position: "relative",
                fontFamily: "sans-serif",
            }}
        >
            {/* Subtle Ambient Radial Back-glow */}
            <div
                style={{
                    position: "absolute",
                    top: "-80px",
                    right: "-60px",
                    width: "550px",
                    height: "550px",
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(6, 182, 212, 0.12) 0%, rgba(168, 85, 247, 0.05) 50%, transparent 70%)",
                }}
            />
            <div
                style={{
                    position: "absolute",
                    bottom: "-60px",
                    left: "-40px",
                    width: "400px",
                    height: "400px",
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(255, 255, 255, 0.04) 0%, transparent 70%)",
                }}
            />

            {/* Top Header Row (No Availability Badge) */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                    paddingBottom: "18px",
                }}
            >
                <div style={{ display: "flex", alignItems: "center" }}>
                    <span
                        style={{
                            color: "#ffffff",
                            fontSize: "32px",
                            fontWeight: 900,
                            letterSpacing: "-0.05em",
                        }}
                    >
                        MAHDI
                    </span>
                    <span
                        style={{
                            color: "#a1a1aa",
                            fontSize: "14px",
                            fontWeight: 600,
                            marginLeft: "4px",
                            marginTop: "-12px",
                        }}
                    >
                        ®
                    </span>
                </div>

                <span
                    style={{
                        color: "#a1a1aa",
                        fontSize: "14px",
                        fontWeight: 700,
                        letterSpacing: "0.15em",
                        fontFamily: "monospace",
                        textTransform: "uppercase",
                    }}
                >
                    mahdimonir.dev
                </span>
            </div>

            {/* Main Body: Left Side (Name + Role + Bio) & Right Side (Circle Avatar) */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    gap: "50px",
                    margin: "auto 0",
                }}
            >
                {/* Left Column matching the new hero */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        flex: 1,
                        maxWidth: "680px",
                    }}
                >
                    {/* 1st Line: MAHDI */}
                    <div
                        style={{
                            color: "#ffffff",
                            fontSize: "108px",
                            fontWeight: 900,
                            lineHeight: 0.85,
                            letterSpacing: "-0.05em",
                            textTransform: "uppercase",
                        }}
                    >
                        MAHDI
                    </div>

                    {/* 2nd Line: Position small text directly beneath MAHDI */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            marginTop: "18px",
                        }}
                    >
                        <div
                            style={{
                                width: "28px",
                                height: "3px",
                                background: "#22d3ee",
                                borderRadius: "2px",
                            }}
                        />
                        <span
                            style={{
                                color: "#e4e4e7",
                                fontSize: "19px",
                                fontWeight: 700,
                                letterSpacing: "0.22em",
                                fontFamily: "monospace",
                                textTransform: "uppercase",
                            }}
                        >
                            {db.role || "Full Stack Developer"}
                        </span>
                    </div>

                    {/* Bio text directly underneath */}
                    <p
                        style={{
                            color: "#a1a1aa",
                            fontSize: "17px",
                            lineHeight: 1.5,
                            marginTop: "16px",
                            marginBottom: 0,
                            maxWidth: "620px",
                        }}
                    >
                        {db.hero.subheadline}
                    </p>
                </div>

                {/* Right Column: Clean Circle Image */}
                {avatarBase64 && (
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "290px",
                            height: "290px",
                            borderRadius: "50%",
                            overflow: "hidden",
                            border: "1px solid rgba(255, 255, 255, 0.2)",
                            boxShadow: "0 25px 60px rgba(0, 0, 0, 0.95), 0 0 35px rgba(255, 255, 255, 0.04)",
                            background: "#000000",
                            flexShrink: 0,
                        }}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={avatarBase64}
                            alt="Moniruzzaman Mahdi"
                            width={290}
                            height={290}
                            style={{
                                width: "290px",
                                height: "290px",
                                borderRadius: "50%",
                                objectFit: "cover",
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Bottom Tech Bar */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                    paddingTop: "16px",
                }}
            >
                <div style={{ display: "flex", gap: "8px" }}>
                    {["Next.js", "TypeScript", "React", "Node.js", "NestJS", "PostgreSQL"].map((tech) => (
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
                        color: "#71717a",
                        fontSize: "13px",
                        fontFamily: "monospace",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                    }}
                >
                    Software Architect • 2026
                </span>
            </div>
        </div>,
        {
            ...size,
            headers: {
                "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
                "Pragma": "no-cache",
                "Expires": "0",
            },
        },
    );
}

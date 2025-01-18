import ComposePageClient from "@/app/(app)/compose/[composeName]/page.client";

export default async function ComposePage({
  params: paramsPromise,
}: {
  params: Promise<{
    composeName?: string;
  }>;
}) {
  const { composeName } = await paramsPromise;
  if (!composeName) {
    return null;
  }

  return <ComposePageClient composeName={composeName} />;
}

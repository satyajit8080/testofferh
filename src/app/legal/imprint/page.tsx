import { Address, Co, Email, LegalPage } from "@/components/content/legal";
import { FactTable } from "@/components/layout/PageShell";
import { F } from "@/components/ui/Tbc";
import { brand } from "@/lib/site";
import { company, contact } from "@/lib/facts";
import { pageMeta } from "@/lib/meta";

export const metadata = pageMeta("Imprint", "Company details for Offerhost: legal name, registration number, VAT ID and registered address.", "/legal/imprint/");

export default function ImprintPage() {
  return (
    <LegalPage title="Imprint" description="Who operates offerhost.com and the Offerhost network." current="/legal/imprint/">
      <p>
        {company.tradeName} is a trade name of <Co />.
      </p>
      <FactTable
        rows={[
          { label: "Company name", value: <Co /> },
          { label: "Legal form", value: <F v={company.legalForm} /> },
          { label: "Registered address", value: <Address /> },
          { label: "Trade register", value: <F v={company.registry} /> },
          { label: "Registration number", value: <F v={company.registrationNumber} /> },
          { label: "VAT ID", value: <F v={company.vatId} /> },
          { label: "Represented by", value: <F v={company.representative} /> },
          { label: "Autonomous System", value: `${brand.asn} (${brand.rir})` },
          { label: "General enquiries", value: <Email k="salesEmail" label="sales email" /> },
          { label: "Support", value: <Email k="supportEmail" label="support email" /> },
          { label: "Abuse reports", value: <Email k="abuseEmail" label="abuse email" /> },
          { label: "Phone", value: <F v={contact.phone} /> },
        ]}
      />
      <p>
        Abuse reports are handled under our <a href="/legal/aup/#abuse">Acceptable Use Policy</a>. The abuse contact for{" "}
        {brand.asn} is also published in the RIPE database.
      </p>
    </LegalPage>
  );
}

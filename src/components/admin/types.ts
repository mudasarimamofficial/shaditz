export type Lead = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  business_type: string | null;
  revenue: string | null;
  message: string | null;
  status: "new" | "contacted" | "closed";
};

export type Settings = {
  id: number;
  admin_email: string;
  slack_webhook_url: string | null;
};

export type Tab = "builder" | "pages" | "leads" | "media" | "homepage" | "custom" | "settings";


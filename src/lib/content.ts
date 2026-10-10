/**
 * Long-form SEO content: use-case pages and the knowledge base.
 * Keep claims generic or link to facts — never state Offerhost numbers that are not in facts.ts.
 */

export type Block =
  | { h: string }
  | { p: string }
  | { list: string[] }
  | { code: string };

export type UseCase = {
  slug: string;
  name: string;
  title: string;
  description: string;
  intro: string;
  /** Plan ids from site.ts, best fit first. */
  plans: string[];
  body: Block[];
  kb?: string[];
};

export const useCases: UseCase[] = [
  {
    slug: "proxmox",
    name: "Proxmox",
    title: "Dedicated Servers for Proxmox VE",
    description: "Run Proxmox VE on a dedicated Ryzen server in Amsterdam: high core counts, lots of RAM and NVMe for your virtual machines and containers.",
    intro: "Proxmox VE turns one dedicated server into your own private cloud of virtual machines and LXC containers — with no per-VM licence cost.",
    plans: ["ryzen-9-7950x", "ryzen-9-5950x", "ryzen-7-9700x"],
    body: [
      { h: "What makes a good Proxmox host" },
      {
        list: [
          "Cores and threads: each VM gets vCPUs, so 16-core Ryzen 9 models give the most headroom.",
          "RAM: memory is usually what runs out first. 128–192 GB lets you run dozens of small VMs.",
          "Two NVMe drives: mirror them with ZFS for redundancy and fast snapshots.",
          "Extra IPs or a routed subnet so each VM can have a public address.",
          "Remote console access, so you can install from the Proxmox ISO and recover if networking breaks.",
        ],
      },
      { h: "Networking your VMs" },
      {
        p: "Most providers do not allow unknown MAC addresses on the uplink, so the usual setup is a routed configuration: the host keeps the main IP and routes additional IPs or an IPv6 subnet to the VMs over a bridge. Our knowledge base walks through the install.",
      },
    ],
    kb: ["install-proxmox", "ipv6-setup"],
  },
  {
    slug: "web-hosting",
    name: "Web Hosting",
    title: "Dedicated Servers for Web Hosting",
    description: "Host websites, WordPress or a reseller panel on a dedicated server with NVMe storage, your own IPs and full root access.",
    intro: "A dedicated server gives your sites predictable performance: no noisy neighbours, NVMe storage and as many sites as the hardware can carry.",
    plans: ["ryzen-5-3600", "ryzen-7-3700x", "ryzen-7-9700x"],
    body: [
      { h: "Typical setups" },
      {
        list: [
          "A control panel such as cPanel, Plesk, DirectAdmin or an open-source alternative for hosting many sites.",
          "A single high-traffic application with a database on the same NVMe drives.",
          "A reseller platform with dedicated IPs per customer.",
        ],
      },
      { h: "What to look for" },
      {
        list: [
          "High single-thread performance — PHP and most CMSs benefit more from clock speed than core count.",
          "RAID 1 across two NVMe drives, plus off-server backups.",
          "Reverse DNS on your IPs so mail from your server is accepted.",
        ],
      },
    ],
    kb: ["first-steps", "reverse-dns"],
  },
  {
    slug: "game-servers",
    name: "Game Servers",
    title: "Dedicated Game Servers in Amsterdam",
    description: "Host Minecraft, CS2, Rust, FiveM and other game servers on high-clock Ryzen CPUs in Amsterdam, close to players across Europe.",
    intro: "Most game servers run their main loop on one thread, so clock speed decides tick rate. Ryzen CPUs with high boost clocks are the standard choice.",
    plans: ["ryzen-9-7950x", "ryzen-7-9700x", "ryzen-9-5950x"],
    body: [
      { h: "Why Amsterdam" },
      { p: "Amsterdam is one of Europe's largest interconnection hubs, with short routes to players in Western and Central Europe and the UK." },
      { h: "Planning capacity" },
      {
        list: [
          "One modern Ryzen core can run one busy game instance; plan one core per instance plus headroom.",
          "Fast NVMe matters for world saves and map loading.",
          "Game traffic is a frequent DDoS target — read exactly what our DDoS protection covers before you launch.",
        ],
      },
    ],
    kb: ["looking-glass"],
  },
  {
    slug: "streaming",
    name: "Streaming",
    title: "Dedicated Servers for Video Streaming",
    description: "Serve live and on-demand video from dedicated servers with 10 Gbps ports, large storage and Amsterdam connectivity.",
    intro: "Streaming is limited by bandwidth before CPU. Choose the port speed for your peak concurrent viewers, and storage for your library.",
    plans: ["ryzen-9-7950x-10g", "storage-4x16tb", "ryzen-9-5950x"],
    body: [
      { h: "Sizing bandwidth" },
      { p: "Multiply peak concurrent viewers by the bitrate. 1,000 viewers at 5 Mbps need about 5 Gbps — beyond a 1 Gbps port, so use a 10 Gbps server or several origins behind a CDN." },
      { h: "Common stacks" },
      { list: ["NGINX with the RTMP module or SRS for live ingest.", "FFmpeg for transcoding — the 16-core Ryzen 9 handles several renditions in parallel.", "A storage server as origin for on-demand libraries."] },
    ],
    kb: ["looking-glass"],
  },
  {
    slug: "nodes",
    name: "Blockchain Nodes",
    title: "Dedicated Servers for Blockchain Nodes",
    description: "Run Ethereum, Bitcoin and other full nodes and RPC endpoints on dedicated servers with fast NVMe and plenty of RAM.",
    intro: "Full nodes and RPC endpoints are disk-heavy: they need fast NVMe for the chain database, steady bandwidth and enough RAM for caching.",
    plans: ["ryzen-9-7950x", "ryzen-9-7950x-10g", "ryzen-9-5950x"],
    body: [
      { h: "Hardware checklist" },
      {
        list: [
          "NVMe storage sized for the chain plus growth — check the client's current requirements, they rise every year.",
          "64 GB RAM or more for execution clients and indexers.",
          "Steady, unmetered outbound traffic for peers and RPC.",
          "Check each network's own hardware guide before you order: validators for some chains need far more than a full node.",
        ],
      },
      { h: "Before you deploy" },
      { p: "Make sure the workload is allowed under our Acceptable Use Policy — running nodes is fine; mining on dedicated servers is a different workload, so ask us first." },
    ],
    kb: ["first-steps"],
  },
];

export type Article = { slug: string; title: string; description: string; body: Block[] };

export const articles: Article[] = [
  {
    slug: "first-steps",
    title: "First steps on a new dedicated server",
    description: "Secure a freshly delivered Linux server: log in with SSH keys, update packages and enable a firewall.",
    body: [
      { p: "Your delivery email contains the server's IP address and login details. Do these steps before you install anything else." },
      { h: "1. Log in and update" },
      { code: "ssh root@YOUR_SERVER_IP\napt update && apt full-upgrade -y" },
      { h: "2. Use SSH keys, not passwords" },
      { code: "# on your own computer\nssh-copy-id root@YOUR_SERVER_IP\n\n# then on the server, in /etc/ssh/sshd_config set:\nPasswordAuthentication no\n\nsystemctl restart ssh" },
      { h: "3. Enable a firewall" },
      { code: "apt install -y ufw\nufw allow OpenSSH\nufw enable" },
      { p: "Keep a remote-console session in mind as your fallback if you lock yourself out." },
    ],
  },
  {
    slug: "install-proxmox",
    title: "Installing Proxmox VE on a dedicated server",
    description: "Two ways to install Proxmox VE on a dedicated server: from the ISO over the remote console, or on top of Debian.",
    body: [
      { h: "Option A — install from the ISO" },
      { p: "Mount the official Proxmox VE ISO through the remote console, boot from it and follow the installer. Choose ZFS (RAID1) across both NVMe drives. Enter the IP address, gateway and netmask from your delivery email." },
      { h: "Option B — install on top of Debian" },
      { p: "Install the Debian release that your Proxmox VE version is built on (from the OS auto-install), then follow the official Proxmox wiki guide “Install Proxmox VE on Debian”. It adds the Proxmox repository, installs the proxmox-ve package and replaces the Debian kernel." },
      { h: "After the install" },
      { list: ["Log in at https://YOUR_SERVER_IP:8006.", "Set up a routed bridge (vmbr0) for your additional IPs.", "Enable the firewall at datacenter level and restrict port 8006 to your own IP."] },
    ],
  },
  {
    slug: "ipv6-setup",
    title: "Configuring IPv6 on Debian and Ubuntu",
    description: "Add your IPv6 subnet to a Debian or Ubuntu server with netplan or ifupdown.",
    body: [
      { p: "Your IPv6 subnet and gateway are shown in your panel. The examples use the documentation prefix 2001:db8::/64 — replace it with your own." },
      { h: "Ubuntu (netplan)" },
      { code: "# /etc/netplan/50-ipv6.yaml\nnetwork:\n  version: 2\n  ethernets:\n    eno1:\n      addresses:\n        - 2001:db8::2/64\n      routes:\n        - to: default\n          via: 2001:db8::1\n\nnetplan apply" },
      { h: "Debian (ifupdown)" },
      { code: "# /etc/network/interfaces\niface eno1 inet6 static\n    address 2001:db8::2/64\n    gateway 2001:db8::1\n\nsystemctl restart networking" },
      { h: "Test it" },
      { code: "ping -6 -c 3 2606:4700:4700::1111" },
    ],
  },
  {
    slug: "reverse-dns",
    title: "Setting reverse DNS (PTR) for your IPs",
    description: "Why reverse DNS matters for mail servers and how to set a PTR record for your IPv4 and IPv6 addresses.",
    body: [
      { p: "Reverse DNS maps an IP address back to a hostname. Mail servers check it: a missing or generic PTR record is a common reason for mail being rejected." },
      { h: "Steps" },
      { list: ["Create an A (and AAAA) record for your hostname, e.g. mail.example.com → your IP.", "Set the PTR record for the IP to the same hostname in the panel, or ask support.", "Check it: dig -x YOUR_SERVER_IP +short"] },
      { p: "The forward and reverse records must match (forward-confirmed reverse DNS)." },
    ],
  },
  {
    slug: "looking-glass",
    title: "Testing our network with the looking glass",
    description: "Use the Offerhost looking glass and mtr to test latency and routing to AS208220 before and after you order.",
    body: [
      { p: "The looking glass at lg.offerhost.com runs ping, traceroute and BGP lookups from our own routers, so you can see the route between our network and yours before you order." },
      { h: "From the looking glass" },
      { list: ["Pick a router location.", "Run ping or traceroute to your own IP or ISP.", "Use a BGP route lookup to see which upstream we use towards your network."] },
      { h: "From your computer" },
      { code: "mtr -rwc 100 YOUR_SERVER_IP" },
      { p: "When reporting a network problem, send us an mtr in both directions — from you to the server and from the server to you." },
    ],
  },
  {
    slug: "rescue-system",
    title: "Recovering a server with the rescue system",
    description: "Boot a network rescue system to repair a server that no longer boots or that you are locked out of.",
    body: [
      { p: "The rescue system is a small Linux environment that boots over the network instead of from your disks. Your data stays untouched until you mount it." },
      { h: "Steps" },
      { list: ["Activate the rescue system in the panel and note the temporary password.", "Reboot the server from the panel.", "SSH in with the temporary password.", "Mount your disks, e.g. mdadm --assemble --scan then mount /dev/md1 /mnt.", "Fix the problem, unmount, deactivate rescue and reboot."] },
    ],
  },
];

export const findUseCase = (slug: string) => useCases.find((u) => u.slug === slug);
export const findArticle = (slug: string) => articles.find((a) => a.slug === slug);

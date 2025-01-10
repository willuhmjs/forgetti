<script lang="ts">
  import CircleUser from "lucide-svelte/icons/circle-user";
  import ChartLine from "lucide-svelte/icons/chart-line";
  import Package from "lucide-svelte/icons/package";
  import House from "lucide-svelte/icons/house";
  import ShoppingCart from "lucide-svelte/icons/shopping-cart";
  import Bell from "lucide-svelte/icons/bell";
  import Menu from "lucide-svelte/icons/menu";
  import Package2 from "lucide-svelte/icons/package-2";
  import Search from "lucide-svelte/icons/search";
  import Users from "lucide-svelte/icons/users";
  import Settings from "lucide-svelte/icons/settings";
  import Logs from "lucide-svelte/icons/logs";
  import Soup from "lucide-svelte/icons/soup";
  import Play from "lucide-svelte/icons/play";
  import Power from "lucide-svelte/icons/power";
  import Restart from "lucide-svelte/icons/rotate-ccw";
  import Square from "lucide-svelte/icons/square";
  
  import Test from "$lib/components/test/test.svelte";
  import Boxmod from "$lib/components/boxmod/boxmod.svelte";

  import { Badge } from "$lib/components/ui/badge/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Card from "$lib/components/ui/card/index.js";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import * as Sheet from "$lib/components/ui/sheet/index.js";
  import LightSwtich from "$lib/components/light-switch/light-switch.svelte";
  import LightSwitch from "$lib/components/light-switch/light-switch.svelte";
    import Checkbox from "$lib/components/ui/checkbox/checkbox.svelte";
    import Label from "$lib/components/ui/label/label.svelte";
    import { Switch } from "$lib/components/ui/switch/index.js";
    import { Slider } from "$lib/components/ui/slider/index.js";
</script>

<div class="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
  <div class="bg-muted/40 hidden border-r md:block">
    <div class="flex h-full max-h-screen flex-col gap-2">
      <div class="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <a href="/logs" class="flex items-center gap-2 font-semibold">
          <Soup class="h-6 w-6" />
          <span class="">Forgetti</span>
        </a>
        <Button variant="outline" size="icon" class="ml-auto h-8 w-8">
          <Bell class="h-4 w-4" />
          <span class="sr-only">Toggle notifications</span>
        </Button>
      </div>
      <div class="flex-1">
        <nav class="grid items-start px-2 text-sm font-medium lg:px-4">
          <a
            href="/admin"
            class="bg-muted text-primary hover:text-primary flex items-center gap-3 rounded-lg px-3 py-2 transition-all"
          >
            <House class="h-4 w-4" />
            Dashboard
          </a>
          <a
            href="/settings"
            class="text-muted-foreground hover:text-primary flex items-center gap-3 rounded-lg px-3 py-2 transition-all"
          >
            <Settings class="h-4 w-4" />
            Settings
          </a>
          <a
            href="/logs"
            class="text-muted-foreground hover:text-primary flex items-center gap-3 rounded-lg px-3 py-2 transition-all"
          >
            <Logs class="h-4 w-4" />
            Logs
          </a>
          <a
            href="blank1"
            class="text-muted-foreground hover:text-primary flex items-center gap-3 rounded-lg px-3 py-2 transition-all"
          >
            <Users class="h-4 w-4" />
            1...
          </a>
          <a
            href="blank2"
            class="text-muted-foreground hover:text-primary flex items-center gap-3 rounded-lg px-3 py-2 transition-all"
          >
            <ChartLine class="h-4 w-4" />
            2...
          </a>
        </nav>
      </div>
      <div class="mt-auto p-4">
        <Card.Root>
          <Card.Header class="p-2 pt-0 md:p-4">
            <Card.Title>Upgrade to Pro</Card.Title>
            <Card.Description>
              Unlock all features and get unlimited access to our support team.
            </Card.Description>
          </Card.Header>
          <Card.Content class="p-2 pt-0 md:p-4 md:pt-0">
            <Button size="sm" class="w-full">Upgrade</Button>
          </Card.Content>
        </Card.Root>
      </div>
    </div>
  </div>
  <div class="flex flex-col">
    <header class="bg-muted/40 flex h-14 items-center gap-4 border-b px-4 lg:h-[60px] lg:px-6">
      <Sheet.Root>
        <Sheet.Trigger asChild let:builder>
          <Button
            variant="outline"
            size="icon"
            class="shrink-0 md:hidden"
            builders={[builder]}
          >
            <Menu class="h-5 w-5" />
            <span class="sr-only">Toggle navigation menu</span>
          </Button>
        </Sheet.Trigger>
        <Sheet.Content side="left" class="flex flex-col">
          <nav class="grid gap-2 text-lg font-medium">
            <a href="##" class="flex items-center gap-2 text-lg font-semibold">
              <Package2 class="h-6 w-6" />
              <span class="sr-only">Acme Inc</span>
            </a>
            <a
              href="##"
              class="text-muted-foreground hover:text-foreground mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2"
            >
              <House class="h-5 w-5" />
              Dashboard
            </a>
            <a
              href="##"
              class="bg-muted text-foreground hover:text-foreground mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2"
            >
              <ShoppingCart class="h-5 w-5" />
              Orders
              <Badge
                class="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
              >
                6
              </Badge>
            </a>
            <a
              href="##"
              class="text-muted-foreground hover:text-foreground mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2"
            >
              <Package class="h-5 w-5" />
              Products
            </a>
            <a
              href="##"
              class="text-muted-foreground hover:text-foreground mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2"
            >
              <Users class="h-5 w-5" />
              Customers
            </a>
            <a
              href="##"
              class="text-muted-foreground hover:text-foreground mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2"
            >
              <ChartLine class="h-5 w-5" />
              Analytics
            </a>
          </nav>
          <div class="mt-auto">
            <Card.Root>
              <Card.Header>
                <Card.Title>Upgrade to Pro</Card.Title>
                <Card.Description>
                  Unlock all features and get unlimited access to our support
                  team.
                </Card.Description>
              </Card.Header>
              <Card.Content>
                <Button size="sm" class="w-full">Upgrade</Button>
              </Card.Content>
            </Card.Root>
          </div>
        </Sheet.Content>
      </Sheet.Root>
      <div class="w-full flex-1">
        <form>
          <div class="relative">
            <Search class="text-muted-foreground absolute left-2.5 top-2.5 h-4 w-4" />
            <Input
              type="search"
              placeholder="Search products..."
              class="bg-background w-full appearance-none pl-8 shadow-none md:w-2/3 lg:w-1/3"
            />
          </div>
        </form>
      </div>
      
      <Button variant="outline" size="icon">
        <Power class="h-4 w-4" />
      </Button>

      <Button variant="outline" size="icon">
        <Restart class="h-4 w-4" />
      </Button>
      
      <Button variant="outline" size="icon">
        <Square class="h-4 w-4" />
      </Button>
    
      <Button variant="outline" size="icon">
        <Play class="h-4 w-4" />
      </Button>

      <LightSwitch />

      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild let:builder>
          <Button
            builders={[builder]}
            variant="secondary"
            size="icon"
            class="rounded-full"
          >
            <CircleUser class="h-5 w-5" />
            <span class="sr-only">Toggle user menu</span>
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end">
          <DropdownMenu.Label>My Account</DropdownMenu.Label>
          <DropdownMenu.Separator />
          <DropdownMenu.Item>Settings</DropdownMenu.Item>
          <DropdownMenu.Item>Support</DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.Item>Logout</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </header>
    
    <main class="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div class="flex items-center">
        <h1 class="text-lg font-semibold md:text-2xl">Inventory</h1>
      </div>
      


      <LightSwitch />
      
      
      
      
      
    
      <div class="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
        
        <div class="flex flex-col items-center gap-1 text-center">
          <h3 class="text-2xl font-bold tracking-tight">You have no products</h3>
          <p class="text-muted-foreground text-sm">
            You can start selling as soon as you add a product.
          </p>
          <Button class="mt-4">Add Product</Button>
        </div>
      
      

      </div>

      
  



      <div class="flex-container" style="display: flex; gap: 20px;">
        <div class="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
          <div class="flex flex-col items-center gap-1 text-center">
            <h3 class="text-2xl font-bold tracking-tight">You have no products</h3>
            <p class="text-muted-foreground text-sm">
              You can start selling as soon as you add a product.
            </p>
            <Button class="mt-4">Add Product</Button>
          </div>
        </div>
      
        <div class="flex flex-1 flex-col items-start justify-evenly rounded-lg border border-dashed shadow-sm p-2">
          <div class="flex flex-col items-start space-y-4">
            
            <h3 class="text-2 tracking-tight mt-4">PLACEHOLDER: Live webcam</h3>
  
            
          </div>
        </div>

        <div class="flex flex-1 flex-col items-center justify-evenly rounded-lg border border-dashed shadow-sm">
          <div class="flex flex-col items-center space-y-2">
            
            <div class="flex w-full max-w-sm flex-col gap-1.5">
              <Label for="email-2">Camera URL</Label>
              <Input type="email" id="email-2" placeholder="https://3dprinter.home/webcam" />
            </div>

            <div class="flex items-center space-x-2" style="margin-left: 0;">
              <Switch id="airplane-mode" />
              <Label for="airplane-mode">Webcam Authentication</Label>
            </div>
            
            
            <h3 class="text-2 tracking-tight">Confidence Threshold</h3>
            <Slider value={[50]} max={100} step={1} class="max-w-[70%]" />
            
            <h3 class="text-2 tracking-tight">CPU Threshold</h3>
            <Slider value={[50]} max={100} step={1} class="max-w-[70%]" />

            <div class="flex w-full max-w-sm flex-col gap-1.5">
              <Label for="email-2">Report Cooldown</Label>
              <Input type="email" id="email-2" placeholder="5 minutes" />
            </div>

            <div class="flex w-full max-w-sm flex-col gap-1.5">
              <Label for="email-2">Model</Label>
              <Input type="email" id="email-2" placeholder="Nano" />
            </div>

            

          </div>
        </div>

        <div class="flex flex-1 flex-col items-center justify-evenly rounded-lg border border-dashed shadow-sm">
          <div class="flex flex-col items-center space-y-2">
            
            <div class="flex items-center space-x-2" style="margin-left: 0;">
              <Switch id="airplane-mode" />
              <Label for="airplane-mode">Enable Discord Webhook</Label>
            </div>
            
            <div class="flex w-full max-w-sm flex-col gap-1.5">
              <Label for="email-2">Webhook URL</Label>
              <Input type="email" id="email-2" placeholder="564531453438543" />
            </div>
            
            <div class="flex items-center space-x-2" style="margin-left: 0;">
              <Switch id="airplane-mode" />
              <Label for="airplane-mode">Ping Discord User </Label>
            </div>
            
            <div class="flex w-full max-w-sm flex-col gap-1.5">
              <Label for="email-2">Discord ID</Label>
              <Input type="email" id="email-2" placeholder="564531453438543" />
            </div>
      
          </div>
        </div>

        

        <div class="flex flex-1 flex-col items-start justify-evenly rounded-lg border border-dashed shadow-sm p-2">
          <div class="flex flex-col items-start space-y-4">
            
            <h3 class="text-2 tracking-tight mt-4">PLACEHOLDER: Debian GNU/Linux 12 (bookworm)</h3>
            <h3 class="text-2 tracking-tight mt-4">PLACEHOLDER: linux 6.1.0-18-amd64</h3>
            <h3 class="text-2 tracking-tight mt-4">PLACEHOLDER: 70C</h3>
            <h3 class="text-2 tracking-tight mt-4">PLACEHOLDER: 1.22up/578.66down</h3>
            <h3 class="text-2 tracking-tight mt-4">PLACEHOLDER: MEM 55%</h3>
            <h3 class="text-2 tracking-tight mt-4">PLACEHOLDER: MEM 83%</h3>
            
          </div>
        </div>

        <div class="flex flex-1 flex-col items-start justify-evenly rounded-lg border border-dashed shadow-sm p-2">
          <div class="flex flex-col items-start space-y-4">
            
            <h3 class="text-2 tracking-tight mt-4">PLACEHOLDER: Saniverse 2024-04-25 082024 32m.gcode</h3>
            <h3 class="text-2 tracking-tight mt-4">PLACEHOLDER: STATUS PRINTING</h3>
            <h3 class="text-2 tracking-tight mt-4">PLACEHOLDER: 0.00m</h3>
            
            <div class="flex items-start space-x-2">
              <Switch id="airplane-mode" />
              <Label for="airplane-mode">Enable Moonraker</Label>
            </div>
        
            <div class="flex w-full max-w-sm flex-col gap-2">
              <Label for="email-2">Moonraker URL</Label>
              <Input type="email" id="email-2" placeholder="564531453438543" style="flex-grow: 1;" />
            </div>
        
            <h3 class="text-2 tracking-tight mt-4">Pause Threshold</h3>
            <Slider value={[50]} max={100} step={1} class="max-w-[70%] mt-2" />
          </div>
        </div>
        
        

      
      </div><div class="flex flex-1 items-center justify-evenly rounded-lg border border-dashed shadow-sm">
        
        
          <div class="flex items-center space-x-2">
            <Checkbox id="terms" />
            <Label for="terms">Enable</Label>
          </div>
        <div>
        <Input type="email" placeholder="enter" class="max-w-xs" />
        </div>
        <div class="flex items-center space-x-2">
          <Switch id="airplane-mode" />
          <Label for="airplane-mode">Airplane Mode</Label>
        </div>
      </div>
      
      <Test />
      <Test />
      <Test />
      <Test />
      <Test />
      <Test />

      <Boxmod />
      



    </main>
  </div>
</div>

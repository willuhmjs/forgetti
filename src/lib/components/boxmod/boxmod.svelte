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
    import Test from "$lib/components/test/test.svelte"
  
  
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
  </main>
    
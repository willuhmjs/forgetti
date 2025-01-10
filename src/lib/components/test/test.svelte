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

<div class="flex flex-1 items-center justify-evenly rounded-lg border border-dashed shadow-sm">
        
        
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
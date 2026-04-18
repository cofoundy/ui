import type { Meta, StoryObj } from "@storybook/react";
import { Crown, Shield, Eye, Headphones } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectItemText,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

const meta: Meta<typeof Select> = {
  title: "UI/Select",
  component: Select,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof Select>;

export const Default: Story = {
  render: () => (
    <div className="w-64">
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Selecciona un rol" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="agent">
            <SelectItemText>Agente</SelectItemText>
          </SelectItem>
          <SelectItem value="supervisor">
            <SelectItemText>Supervisor</SelectItemText>
          </SelectItem>
          <SelectItem value="admin">
            <SelectItemText>Admin</SelectItemText>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};

export const WithIconsAndDescriptions: Story = {
  render: () => (
    <div className="w-48">
      <Select defaultValue="supervisor">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="agent">
            <div className="flex items-start gap-2.5">
              <Headphones className="size-4 mt-0.5 text-[var(--text-muted)]" />
              <div className="flex flex-col gap-0.5">
                <SelectItemText>
                  <span className="font-medium">Agente</span>
                </SelectItemText>
                <span className="text-xs text-[var(--text-muted)]">
                  Atiende conversaciones asignadas
                </span>
              </div>
            </div>
          </SelectItem>
          <SelectItem value="supervisor">
            <div className="flex items-start gap-2.5">
              <Eye className="size-4 mt-0.5 text-[var(--text-muted)]" />
              <div className="flex flex-col gap-0.5">
                <SelectItemText>
                  <span className="font-medium">Supervisor</span>
                </SelectItemText>
                <span className="text-xs text-[var(--text-muted)]">
                  Supervisa conversaciones y analytics
                </span>
              </div>
            </div>
          </SelectItem>
          <SelectItem value="admin">
            <div className="flex items-start gap-2.5">
              <Shield className="size-4 mt-0.5 text-[var(--text-muted)]" />
              <div className="flex flex-col gap-0.5">
                <SelectItemText>
                  <span className="font-medium">Admin</span>
                </SelectItemText>
                <span className="text-xs text-[var(--text-muted)]">
                  Gestiona equipo, canales e IA
                </span>
              </div>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};

export const WithLabelAndSeparator: Story = {
  render: () => (
    <div className="w-64">
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Asignar rol" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Roles del equipo</SelectLabel>
            <SelectItem value="agent">Agente</SelectItem>
            <SelectItem value="supervisor">Supervisor</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Acceso total</SelectLabel>
            <SelectItem value="owner">
              <div className="flex items-center gap-2">
                <Crown className="size-4" />
                Owner
              </div>
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  ),
};

export const Small: Story = {
  render: () => (
    <div className="w-48">
      <Select>
        <SelectTrigger size="sm">
          <SelectValue placeholder="Rol" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="agent">Agente</SelectItem>
          <SelectItem value="supervisor">Supervisor</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="w-64">
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Deshabilitado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">Opción A</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};

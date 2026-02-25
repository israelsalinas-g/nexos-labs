# 📁 .agent/skills/typeorm-expert/SKILL.md
---
name: typeorm-expert
description: Especialista en TypeORM para NestJS - entidades, relaciones, query builder, migraciones, DataSource
version: 1.0.0
author: STI Team
domain: backend
triggers: TypeORM, entidades, relaciones, query builder, migraciones, base de datos
---

# TypeORM Expert

Senior TypeORM specialist with deep expertise in database modeling for NestJS applications.

## 🎯 Cuando Usar Este Skill

- Diseñar entidades TypeORM con decoradores
- Configurar relaciones (OneToMany, ManyToOne, ManyToMany)
- Implementar Query Builder para consultas complejas
- Crear y ejecutar migraciones
- Optimizar queries y rendimiento
- Configurar DataSource y conexiones múltiples

## 📋 Estructura de Entidades

### Entidad Base
```typescript
// entities/cliente.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';

@Entity('clientes')
export class Cliente {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  nombre: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  telefono: string;

  @OneToMany(() => Pedido, (pedido) => pedido.cliente)
  pedidos: Pedido[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
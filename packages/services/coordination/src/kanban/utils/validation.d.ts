/**
* @fileoverview Validation Utilities - Runtime Safety with Foundation
*
* Professional validation utilities using foundation's centralized Zod integration.';
* Provides runtime type safety for kanban domain objects.
*
* @author Claude-Zen Team
* @since 1.0.0
* @version 1.0.0
*/
import { z } from '@claude-zen/foundation';
export declare const TaskStateSchema: z.ZodEnum<['backlog,']>;
/**
* WIP limits validation schema
*/
export declare const WIPLimitsSchema: z.ZodObject<
{
analysis: z.ZodObject<
{
id: z.ZodObject<
z.ZodRawShape,
'strip',
z.ZodTypeAny,
{
[x: string]: any;
'},
{
[x: string]: any;
'}
>;
'},
'strip',
z.ZodTypeAny,
{
id?: {
[x: string]: any;
'};
'},
{
id?: {
[x: string]: any;
'};
'}
>;
'},
'strip',
z.ZodTypeAny,
{
analysis?: {
id?: {
[x: string]: any;
'};
'};
'},
{
analysis?: {
id?: {
[x: string]: any;
'};
'};
'}
>;
//# sourceMappingURL=validation.d.ts.map

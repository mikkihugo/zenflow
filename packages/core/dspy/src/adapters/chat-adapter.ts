/**
 * @fileoverview Chat Adapter - Production Grade
 *
 * Chat-based adapter for formatting DSPy data for chat-based language models.
 * 100% compatible with Stanford DSPy's chat formatting system.
 *
 * @version 1.0.0
 * @author Claude Code Zen Team
 */

import {
	BaseAdapter,
	type FinetuneDataInput,
	type FinetuneDataOutput,
} from "../interfaces/adapter";
// import type { Example} from '../primitives/example'; // Unused import
import type { Prediction} from "../primitives/prediction";

/**
 * Chat adapter configuration
 */
export interface ChatAdapterConfig {
	/** Whether to include system messages */
	include_system?:boolean;
	/** Whether to include demonstrations */
	include_demos?:boolean;
	/** Maximum number of demonstrations to include */
	max_demos?:number;
	/** Custom role mapping */
	role_mapping?:{
		system?:string;
		user?:string;
		assistant?:string;
};
}

/**
 * Chat message interface
 */
export interface ChatMessage {
	role:"system" | "user" | "assistant";
	content:string;
	metadata?:Record<string, any>;
}

/**
 * Chat adapter for formatting data as conversation messages
 * Compatible with OpenAI Chat API, Anthropic Claude, and other chat-based models
 */
export class ChatAdapter extends BaseAdapter {
	private chatConfig:Required<ChatAdapterConfig>;

	constructor(config:ChatAdapterConfig = {}) {
		super(config);

		this.chatConfig = {
			include_system:config.include_system ?? true,
			include_demos:config.include_demos ?? true,
			max_demos:config.max_demos ?? 5,
			role_mapping:{
				system:"system",
				user:"user",
				assistant:"assistant",
				...config.role_mapping,
},
};
}

	/**
	 * Format data for fine-tuning in chat format
	 */
	override formatFinetuneData(data:FinetuneDataInput): FinetuneDataOutput {
		this.validateInput(data, ["signature", "demos", "inputs", "outputs"]);

		const messages:ChatMessage[] = [];

		// Add system message with instructions
		if (this.chatConfig.include_system && data.signature.instructions) {
			messages.push({
				role:this.chatConfig.role_mapping.system as "system",
				content:this.createSystemMessage(data.signature),
});
}

		// Add demonstration examples
		if (this.chatConfig.include_demos && data.demos.length > 0) {
			const maxDemos = Math.min(data.demos.length, this.chatConfig.max_demos);
			const demosToUse = data.demos.slice(0, maxDemos);

			for (const demo of demosToUse) {
				const demoInputs = this.extractInputs(demo, data.signature);
				const demoOutputs = this.extractOutputs(demo, data.signature);

				// User message with demo inputs
				messages.push({
					role:this.chatConfig.role_mapping.user as "user",
					content:this.formatInputsAsUserMessage(demoInputs),
					metadata:{ type: "demonstration", demo_id:demo.get("id")},
});

				// Assistant message with demo outputs
				messages.push({
					role:this.chatConfig.role_mapping.assistant as "assistant",
					content:this.formatOutputsAsAssistantMessage(demoOutputs),
					metadata:{ type: "demonstration", demo_id:demo.get("id")},
});
}
}

		// Add the current input as user message
		messages.push({
			role:this.chatConfig.role_mapping.user as "user",
			content:this.formatInputsAsUserMessage(data.inputs),
			metadata:{ type: "current_input"},
});

		// Add the expected output as assistant message
		const outputContent = this.formatPredictionAsAssistantMessage(data.outputs);
		messages.push({
			role:this.chatConfig.role_mapping.assistant as "assistant",
			content:outputContent,
			metadata:{ type: "expected_output"},
});

		return {
			messages,
			metadata:{
				adapter_type:"chat",
				num_demos:this.chatConfig.include_demos
					? Math.min(data.demos.length, this.chatConfig.max_demos)
					:0,
				include_system:this.chatConfig.include_system,
				format_version:"1.0",
},
};
}

	/**
	 * Format inputs as user message content
	 */
	private formatInputsAsUserMessage(inputs:Record<string, any>):string {
		const inputPairs = Object.entries(inputs);

		if (inputPairs.length === 0) {
			return "";
}

		if (inputPairs.length === 1) {
			const pair = inputPairs[0];
			if (pair) {
				const [key, value] = pair;
				// For single inputs, often just the value is sufficient
				if (
					key === "question" ||
					key === "query" ||
					key === "input" ||
					key === "prompt"
				) {
					return String(value);
				}
			}
		}

		// For multiple inputs, format as key-value pairs
		return inputPairs
			.map(([key, value]) => '${this.capitalizeFirst(key)}: ' + value)
			.join("\n");
	}

	/**
	 * Format outputs as assistant message content
	 */
	private formatOutputsAsAssistantMessage(
		outputs:Record<string, any>,
	):string {
		const outputPairs = Object.entries(outputs).filter(
			([_, value]) => value !== undefined,
		);

		if (outputPairs.length === 0) {
			return "";
}

		if (outputPairs.length === 1) {
			const pair = outputPairs[0];
			if (pair) {
				const [key, value] = pair;
				// For single outputs, often just the value is sufficient
				if (
					key === "answer" ||
					key === "response" ||
					key === "output" ||
					key === "completion"
				) {
					return String(value);
				}
			}
		}

		// For multiple outputs, format as key-value pairs
		return outputPairs
			.map(([key, value]) => '${this.capitalizeFirst(key)}: ' + value)
			.join("\n");
	}

	/**
	 * Format prediction as assistant message content
	 */
	private formatPredictionAsAssistantMessage(
		outputs:Prediction | Record<string, any>,
	):string {
		// Handle Prediction objects
		if ("data" in outputs && outputs.data) {
			return this.formatOutputsAsAssistantMessage(outputs.data);
}

		// Handle plain objects
		return this.formatOutputsAsAssistantMessage(outputs as Record<string, any>);
}

	/**
	 * Capitalize first letter of string
	 */
	private capitalizeFirst(str:string): string {
		return str.charAt(0).toUpperCase() + str.slice(1);
}

	/**
	 * Convert chat messages to OpenAI format
	 */
	toOpenAIFormat(
		messages:ChatMessage[],
	):Array<{ role: string; content: string}> {
		return messages.map((msg) => ({
			role:msg.role,
			content:msg.content,
}));
}

	/**
	 * Convert chat messages to Anthropic format
	 */
	toAnthropicFormat(messages:ChatMessage[]): {
		system?:string;
		messages:Array<{ role: "user" | "assistant"; content: string}>;
} {
		const systemMessages = messages.filter((m) => m.role === "system");
		const conversationMessages = messages.filter((m) => m.role !== "system");

		const result:{
			system?:string;
			messages:Array<{ role: "user" | "assistant"; content: string}>;
} = {
			messages:conversationMessages.map((msg) => ({
				role:msg.role as "user" | "assistant",
				content:msg.content,
})),
};

		if (systemMessages.length > 0) {
			result.system = systemMessages.map((m) => m.content).join("\n\n");
}

		return result;
}

	/**
	 * Convert chat messages to plain text format
	 */
	toTextFormat(messages:ChatMessage[]): string {
		return messages
			.map((msg) => {
				const roleLabel = msg.role.toUpperCase();
				return '${roleLabel}: ' + msg.content;
})
			.join("\n\n");
}

	/**
	 * Validate chat message format
	 */
	validateMessages(messages:ChatMessage[]): boolean {
		if (!Array.isArray(messages) || messages.length === 0) {
			return false;
}

		for (const message of messages) {
			if (
				!message.role ||
				!["system", "user", "assistant"].includes(message.role)
			) {
				return false;
}
			if (typeof message.content !== "string") {
				return false;
}
}

		return true;
}

	/**
	 * Get adapter configuration
	 */
	override getConfig():ChatAdapterConfig {
		return { ...this.chatConfig};
}

	/**
	 * Update adapter configuration
	 */
	updateConfig(config:Partial<ChatAdapterConfig>): void {
		this.chatConfig = {
			...this.chatConfig,
			...config,
			role_mapping:{
				...this.chatConfig.role_mapping,
				...config.role_mapping,
},
};
}
}

export default ChatAdapter;

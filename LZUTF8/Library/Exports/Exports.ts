﻿module LZUTF8
{
	// Core
	export function compress(input: any, options?: CompressionOptions): any
	{
		if (input === undefined || input === null)
			throw new TypeError("compress: undefined or null input received");

		options = ObjectTools.extendObject({ outputEncoding: "ByteArray" }, options);

		var compressor = new Compressor();
		var compressedBytes = compressor.compressBlock(input);

		return CompressionCommon.encodeCompressedBytes(compressedBytes, options.outputEncoding);
	}

	export function decompress(input: any, options?: CompressionOptions): any
	{
		if (input === undefined || input === null)
			throw new TypeError("decompress: undefined or null input received");

		options = ObjectTools.extendObject({ inputEncoding: "ByteArray", outputEncoding: "String" }, options);

		input = CompressionCommon.decodeCompressedData(input, options.inputEncoding);

		var decompressor = new Decompressor();
		var decompressedBytes = decompressor.decompressBlock(input);

		return CompressionCommon.encodeDecompressedBytes(decompressedBytes, options.outputEncoding);
	}

	// Async
	export function compressAsync(input: any, options: CompressionOptions, callback: (result: any, error?: Error) => void)
	{
		if (callback == null)
			callback = () => { };

		if (input === undefined || input === null)
		{
			callback(undefined, new TypeError("compressAsync: undefined or null input received"));
			return;
		}

		var defaultOptions: CompressionOptions =
			{
				inputEncoding: CompressionCommon.detectCompressionSourceEncoding(input),
				outputEncoding: "ByteArray",
				useWebWorker: true,
				blockSize: 65536
			}

		options = ObjectTools.extendObject(defaultOptions, options);

		EventLoop.enqueueImmediate(() =>
		{
			if (options.useWebWorker === true && WebWorker.isSupported())
			{
				WebWorker.createGlobalWorkerIfItDoesntExist();
				WebWorker.compressAsync(input, options, callback);
			}
			else
			{
				AsyncCompressor.compressAsync(input, options, callback);
			}
		});
	}

	export function decompressAsync(input: any, options: CompressionOptions, callback: (result: any, error?: Error) => void)
	{
		if (callback == null)
			callback = () => { };

		if (input === undefined || input === null)
		{
			callback(undefined, new TypeError("decompressAsync: undefined or null input received"));
			return;
		}

		var defaultOptions: CompressionOptions =
			{
				inputEncoding: "ByteArray",
				outputEncoding: "String",
				useWebWorker: true,
				blockSize: 65536
			}

		options = ObjectTools.extendObject(defaultOptions, options);

		EventLoop.enqueueImmediate(() =>
		{
			if (options.useWebWorker === true && WebWorker.isSupported())
			{
				WebWorker.createGlobalWorkerIfItDoesntExist();
				WebWorker.decompressAsync(input, options, callback);
			}
			else
			{
				AsyncDecompressor.decompressAsync(input, options, callback);
			}
		});
	}

	// Node.js streams
	export function createCompressionStream(): stream.Transform
	{
		return AsyncCompressor.createCompressionStream();
	}

	export function createDecompressionStream(): stream.Transform
	{
		return AsyncDecompressor.createDecompressionStream();
	}

	declare var TextDecoder;
	declare var TextEncoder;
	var globalUTF8TextEncoder;
	var globalUTF8TextDecoder;
	
	// Encodings
	export function encodeUTF8(str: string): ByteArray
	{
		if (typeof str !== "string")
			throw new TypeError("encodeUTF8: null, undefined or invalid input type received");

		if (runningInNodeJS())
		{
			return convertToByteArray(new Buffer(str, "utf8"));
		}
		if (typeof TextEncoder === "function")
		{
			if (globalUTF8TextEncoder === undefined)
				globalUTF8TextEncoder = new TextEncoder("utf-8");

			return convertToByteArray(globalUTF8TextEncoder.encode(str));
		}
		else
			return Encoding.UTF8.encode(str);
	}

	export function decodeUTF8(input: ByteArray): string
	{
		input = convertToByteArray(input);

		if (runningInNodeJS())
		{
			return (<any>input).toString("utf8");
		}
		else if (typeof TextDecoder === "function")
		{
			if (globalUTF8TextDecoder === undefined)
				globalUTF8TextDecoder = new TextDecoder("utf-8");

			return globalUTF8TextDecoder.decode(input);
		}
		else
			return Encoding.UTF8.decode(input);
	}

	export function encodeBase64(input: any): string
	{
		if (input == null)
			throw new TypeError("decodeBase64: undefined or null input received");

		input = convertToByteArray(input);

		if (runningInNodeJS())
		{
			var result = input.toString("base64");

			if (result == null)
				throw new Error("encodeBase64: failed encdoing Base64");

			return result;
		}
		else
			return Encoding.Base64.encode(input);
	}

	export function decodeBase64(str: string): ByteArray
	{
		if (typeof str !== "string")
			throw new TypeError("decodeBase64: invalid input type received");

		if (runningInNodeJS())
		{
			var result = convertToByteArray(new Buffer(str, "base64"));

			if (result === null)
				throw new Error("decodeBase64: failed decoding Base64");

			return result;
		}
		else
			return Encoding.Base64.decode(str);
	}

	/*
	export function decodeConcatenatedBase64(concatBase64Strings: string): ByteArray
	{
		var base64Strings: string[] = [];

		for (var offset = 0; offset < concatBase64Strings.length; )
		{
			var endPosition = concatBase64Strings.indexOf("=", offset);

			if (endPosition == -1)
			{
				endPosition = concatBase64Strings.length;
			}
			else
			{
				if (concatBase64Strings[endPosition] == "=")
					endPosition++;

				if (concatBase64Strings[endPosition] == "=") // Note: if endPosition equals string length the char would be undefined
					endPosition++;
			}

			base64Strings.push(concatBase64Strings.substring(offset, endPosition));
			offset = endPosition;
		}

		var decodedByteArrays: ByteArray[] = [];

		for (var i = 0; i < base64Strings.length; i++)
		{
			decodedByteArrays.push(decodeBase64(base64Strings[i]));
		}

		return ArrayTools.joinByteArrays(decodedByteArrays);
	}
	*/

	export function encodeBinaryString(input: any): string
	{
		input = convertToByteArray(input);
		return Encoding.BinaryString.encode(input);
	}

	export function decodeBinaryString(str: string): ByteArray
	{
		return Encoding.BinaryString.decode(str);
	}

	export interface CompressionOptions
	{
		inputEncoding?: string;
		outputEncoding?: string;
		useWebWorker?: boolean;
		blockSize?: number;
	}
}
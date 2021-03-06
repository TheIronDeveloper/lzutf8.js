﻿module LZUTF8
{
	export class CompressionCommon
	{
		static getCroppedBuffer(buffer: ByteArray, cropStartOffset: number, cropLength: number, additionalCapacity: number = 0): ByteArray
		{
			var croppedBuffer = newByteArray(cropLength + additionalCapacity);
			croppedBuffer.set(buffer.subarray(cropStartOffset, cropStartOffset + cropLength));

			return croppedBuffer;
		}

		static getCroppedAndAppendedBuffer(buffer: ByteArray, cropStartOffset: number, cropLength: number, bufferToAppend: ByteArray): ByteArray
		{
			return ArrayTools.joinByteArrays([buffer.subarray(cropStartOffset, cropStartOffset + cropLength), bufferToAppend]);
		}

		static detectCompressionSourceEncoding(input: any): string
		{
			if (typeof input == "string")
				return "String";
			else
				return "ByteArray";
		}

		static encodeCompressedBytes(compressedBytes: ByteArray, outputEncoding: string): any
		{
			switch (outputEncoding)
			{
				case "ByteArray":
					return compressedBytes;
				case "BinaryString":
					return encodeBinaryString(compressedBytes);
				case "Base64":
					return encodeBase64(compressedBytes);
				default:
					throw new TypeError("encodeCompressedBytes: invalid output encoding requested");
			}
		}

		static decodeCompressedData(compressedData: any, inputEncoding: string): ByteArray
		{
			if (inputEncoding == "ByteArray" && typeof compressedData == "string")
				throw new TypeError("decodeCompressedData: receieved input was string when encoding was set to a ByteArray");

			switch (inputEncoding)
			{
				case "ByteArray":
					return convertToByteArray(compressedData);
				case "BinaryString":
					return decodeBinaryString(compressedData);
				case "Base64":
					return decodeBase64(compressedData);
				default:
					throw new TypeError("decodeCompressedData: invalid input encoding requested");
			}
		}

		static encodeDecompressedBytes(decompressedBytes: ByteArray, outputEncoding: string): any
		{
			switch (outputEncoding)
			{
				case "ByteArray":
					return decompressedBytes;
				case "String":
					return decodeUTF8(decompressedBytes);
				default:
					throw new TypeError("encodeDecompressedBytes: invalid output encoding requested");
			}
		}
	}

	export interface CompressorHashTable
	{
		addValueToBucket(bucketIndex: number, valueToAdd: number);
		getArraySegmentForBucketIndex(bucketIndex: number, outputObject?: ArraySegment<number>): ArraySegment<number>;
		getUsedBucketCount(): number;
		getTotalElementCount(): number;
	}
} 
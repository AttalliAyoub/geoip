import React, { type FormEvent, useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as api from "../client";

const EDITION_STORAGE_KEY = "geoip.edition";

interface GeoIpReverseFormData {
	query: string;
	type: "country" | "city";
}

export interface GeoIpReverseFormProps {
	databases: api.GeoIpDatabaseStatus[];
	recaptchaFn?: () => Promise<string | undefined>;
}

export const GeoIpReverseForm: React.FC<GeoIpReverseFormProps> = ({
	databases,
	recaptchaFn,
}) => {
	const {register, handleSubmit} = useForm<GeoIpReverseFormData>({
		defaultValues: { type: "country", query: "" }
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [result, setResult] = useState<api.GeoIpReverseLookupResult | null>(null);
	const [edition, setEdition] = useState("");
	
	useEffect(() => {
		if (!databases.length) return;
		const storedEdition = localStorage.getItem(EDITION_STORAGE_KEY);
		if (storedEdition !== null) {
			const database = databases.find(database => database.edition === storedEdition);
			if (database) {
				setEdition(database.edition);
				return;
			}
		}
		setEdition(databases[0].edition);
	}, [databases]);
	
	useEffect(() => {
		if (!databases.length || !edition) return;
		localStorage.setItem(EDITION_STORAGE_KEY, edition);
	}, [databases, edition]);
	
	const handleFormSubmit = useCallback((evt: FormEvent) => {
		handleSubmit(async data => {
			try {
				setError(null);
				setResult(null);
				setLoading(true);
				const recaptchaToken = recaptchaFn ? await recaptchaFn() : undefined;
				const headers: Record<string, string> = {};
				if (recaptchaToken !== undefined) {
					headers["X-Recaptcha-Token"] = recaptchaToken;
				}
				const res = await api.lookupGeoIpReverse({
					query: {
						country: data.type === "country" ? data.query : undefined,
						city: data.type === "city" ? data.query : undefined,
						edition,
					},
					headers,
				});
				if (res.error) {
					setError(res.error.error ?? `Error ${res.response.status}`);
					return;
				}
				setResult(res.data);
			} catch (err: any) {
				setError(err.message ?? err.toString());
			} finally {
				setLoading(false);
			}
		})(evt);
	}, [edition, recaptchaFn]);

	const handleEditionChange = useCallback((evt: React.ChangeEvent<HTMLSelectElement>) => {
		setEdition(evt.target.value);
	}, []);
	
	return (
		<div className="card bg-base-200 shadow-sm mb-8">
			<div className="card-body">
				<h2 className="card-title">Reverse Lookup</h2>
				<form onSubmit={handleFormSubmit} className="mb-4">
					<div className="flex content-stretch gap-4 flex-col md:flex-row md:gap-0 md:join w-full">
						<select className="select join-item" {...register("type")}>
							<option value="country">Country</option>
							<option value="city">City</option>
						</select>
						<input
							type="text"
							placeholder="Enter country code, name or city name"
							className="input join-item w-full md:flex-1"
							{...register("query", {required: true})}
							required
						/>
						<select
							className="select w-full md:w-auto join-item"
							value={edition}
							onChange={handleEditionChange}
						>
							{databases.map(database => (
								<option key={database.edition} value={database.edition}>
									{database.edition}
								</option>
							))}
						</select>
						<button
							type="submit"
							className="btn btn-neutral join-item"
							disabled={loading || !databases.length}
						>
							Lookup
						</button>
					</div>
				</form>
				{error && (<div className="alert alert-error alert-soft mb-4">
					{error}
				</div>)}
				{result && (<div className="alert alert-success alert-soft mb-4">
					Found {result.networks.length} networks in {(result.elapsed * 1000).toFixed(3)}ms
				</div>)}
				{result && result.networks.length > 0 && (
					<div className="max-h-96 overflow-y-auto bg-base-100 p-4 rounded-box font-mono text-sm">
						{result.networks.slice(0, 100).map(net => <div key={net}>{net}</div>)}
						{result.networks.length > 100 && <div className="text-gray-500 italic mt-2">...and {result.networks.length - 100} more</div>}
					</div>
				)}
			</div>
		</div>
	);
};

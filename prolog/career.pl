:- dynamic skill/2.
:- dynamic interest/2.
:- dynamic personality/2.
:- dynamic work/2.

% --- helpers to get values (default 0) ---
skill_value(Name, V) :- skill(Name, V), !.
skill_value(_, 0).

interest_value(Name, V) :- interest(Name, V), !.
interest_value(_, 0).

personality_value(Name, V) :- personality(Name, V), !.
personality_value(_, 0).

work_value(Name, V) :- work(Name, V), !.
work_value(_, 0).

% --- known career names ---
career_name(backend).
career_name(data_scientist).
career_name(data_engineer).
career_name(ai_engineer).
career_name(web_developer).
career_name(devops_engineer).
career_name(security_engineer).
career_name(full_stack).
career_name(mobile_developer).

% --- compute_score(Career, Score, ExplanationList) ---
compute_score(backend, Score, Explain) :-
	skill_value(dbms, DB), skill_value(dsa, DSA), skill_value(os, OS),
	personality_value(analytical, P), work_value(coding, W),
	% weights
	Score is DB*0.5 + DSA*0.3 + OS*0.1 + P*0.05 + W*0.05,
	Explain = [dbms-DB, dsa-DSA, os-OS, personality-P, work-W].

compute_score(data_scientist, Score, Explain) :-
	skill_value(python, Py), skill_value(statistics, Stat), skill_value(ml, ML),
	interest_value(data, I), personality_value(analytical, P), work_value(coding, W),
	Score is Py*0.4 + Stat*0.2 + ML*0.2 + I*0.1 + P*0.05 + W*0.05,
	Explain = [python-Py, statistics-Stat, ml-ML, interest-I, personality-P].

compute_score(data_engineer, Score, Explain) :-
	skill_value(dbms, DB), skill_value(python, Py), skill_value(etl, ETL),
	interest_value(data, I), work_value(coding, W),
	Score is DB*0.45 + ETL*0.25 + Py*0.15 + I*0.1 + W*0.05,
	Explain = [dbms-DB, etl-ETL, python-Py, interest-I].

compute_score(ai_engineer, Score, Explain) :-
	skill_value(ml, ML), skill_value(python, Py), skill_value(deep_learning, DL),
	interest_value(ai, I), personality_value(analytical, P),
	Score is ML*0.45 + DL*0.3 + Py*0.15 + I*0.05 + P*0.05,
	Explain = [ml-ML, deep_learning-DL, python-Py, interest-I].

compute_score(web_developer, Score, Explain) :-
	skill_value(web, Web), skill_value(js, JS), skill_value(css, CSS),
	work_value(coding, W), personality_value(creative, C),
	Score is Web*0.4 + JS*0.3 + CSS*0.15 + W*0.1 + C*0.05,
	Explain = [web-Web, js-JS, css-CSS, personality-C].

compute_score(devops_engineer, Score, Explain) :-
	skill_value(docker, Dock), skill_value(kubernetes, K8s), skill_value(cloud, Cloud),
	skill_value(scripting, Script), work_value(coding, W),
	Score is Dock*0.3 + K8s*0.3 + Cloud*0.25 + Script*0.1 + W*0.05,
	Explain = [docker-Dock, kubernetes-K8s, cloud-Cloud].

compute_score(security_engineer, Score, Explain) :-
	skill_value(security, Sec), skill_value(networks, Net), skill_value(crypto, Cry),
	personality_value(analytical, P), work_value(coding, W),
	Score is Sec*0.45 + Net*0.25 + Cry*0.15 + P*0.1 + W*0.05,
	Explain = [security-Sec, networks-Net, crypto-Cry].

compute_score(full_stack, Score, Explain) :-
	skill_value(web, Web), skill_value(dbms, DB), skill_value(js, JS), skill_value(react, React),
	work_value(coding, W), personality_value(creative, C),
	Score is Web*0.25 + DB*0.25 + JS*0.2 + React*0.15 + W*0.1 + C*0.05,
	Explain = [web-Web, dbms-DB, js-JS, react-React].

compute_score(mobile_developer, Score, Explain) :-
	skill_value(android, And), skill_value(ios, iOS), skill_value(java, Java),
	work_value(coding, W), personality_value(creative, C),
	Score is And*0.35 + iOS*0.35 + Java*0.15 + W*0.1 + C*0.05,
	Explain = [android-And, ios-iOS, java-Java].

% comparator for predsort: sort descending on Score
compare_scores(Delta, S1-_-_, S2-_-_) :-
	( S1 < S2 -> Delta = '>' ; S1 > S2 -> Delta = '<' ; Delta = '=' ).

% Format explanation list as comma-separated "name:score" atoms (avoid Name:V in findall — ':' is module syntax in SWI)
explain_to_string(List, Str) :-
	findall(Atom,
		( member(Name-V, List),
		  format(atom(Atom), '~w:~2f', [Name, V])
		),
		Atoms),
	atomic_list_concat(Atoms, ", ", Str).

% Recommend top 3 careers and write lines: Name::Score::Explain
recommend_top3 :-
	findall(Score-Name-Explain, (career_name(Name), compute_score(Name, Score, Explain)), Raw),
	predsort(compare_scores, Raw, Sorted),
	% take top 3
	take(3, Sorted, Top),
	forall(member(Score-Name-Explain, Top), (
		explain_to_string(Explain, SExplain),
		format('~w::~2f::~w~n', [Name, Score, SExplain])
	)).

% helper take(N,List, Prefix)
take(0, _, []) :- !.
take(_, [], []) :- !.
take(N, [H|T], [H|R]) :- N1 is N-1, take(N1, T, R).

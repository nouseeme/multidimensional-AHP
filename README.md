# Decision Studio — AHP + TOPSIS

Compare suppliers, products, or locations using your priorities and their actual data. AHP helps you decide what matters. TOPSIS helps you compare the available options across those criteria.

This project grows out of [AHP Matrix Calculator](https://github.com/nouseeme/AHP-Matrix-Calculator-for-Decision-Making). The original calculator stops at criterion weights; Decision Studio carries those priorities through to an explained ranking of alternatives.

## A case study: does the cheapest supplier offer the best choice?

Imagine buying the same item from two suppliers. Their prices are almost identical, but their delivery times are very different:

| Criterion | Supplier A | Supplier B | Better direction |
| --- | ---: | ---: | --- |
| Price | Rp100,000 | Rp100,100 | Lower |
| Delivery time | 10 days | 1 day | Lower |

A saves Rp100. B delivers nine days sooner. Picking the cheapest option ignores delivery; picking the fastest ignores price. Comparing the numbers directly does not help either, because Rupiah and days use different units.

In the example, you judge price to be twice as important as delivery. AHP turns that comparison into weights of **66.67% for price** and **33.33% for delivery**. TOPSIS then compares the suppliers using both these weights and their data.

| Rank | Supplier | TOPSIS closeness score |
| --- | --- | ---: |
| 1 | Supplier B | 0.99842409 |
| 2 | Supplier A | 0.00157591 |

B ranks first even though price matters more. Its price disadvantage is very small on the normalized price scale, while its delivery advantage is large on the normalized delivery scale. B is therefore much closer to the best combination available: A's price and B's delivery time.

**A score of 0.9984 does not mean a 99.84% chance of being correct.** It describes relative closeness to that combination under this model. The example is synthetic and is included in the app as **Try supplier example**; it is not a published procurement result.

## Why combine AHP and TOPSIS?

**AHP makes priorities explicit.** Instead of guessing percentage weights, you compare criteria in pairs: how much does price matter compared with delivery? The calculation produces weights that total 100%. With three or more criteria, it also checks whether your judgments contradict one another. Saaty's paper explains this use of comparisons and consistency in AHP. [Saaty, 2008](https://doi.org/10.1504/IJSSCI.2008.017590)

**TOPSIS brings measured performance into the decision.** It normalizes the data, applies the weights, and measures each alternative's distance from the best and worst combinations. This project uses vector normalization and Euclidean distance. Published work shows that the normalization choice itself can affect the result, so the method is fixed and visible here. [Zavadskas, Zakarevicius & Antucheviciene, 2006](https://doi.org/10.15388/Informatica.2006.158)

**The combination has been used in supplier selection.** Akcan and Güldeş studied hospital suppliers using AHP to establish criterion weights and several methods, including TOPSIS, to rank suppliers. Their study supports the general decision structure. This app uses a simpler workflow with user-entered numerical data and does not reproduce their full evaluation process. [Akcan & Güldeş, 2019](https://doi.org/10.1155/2019/5614892)

For users, the benefit is a decision they can inspect: priorities, original data, rankings, and calculation details appear together. You can also check whether small changes to the weights change the leading option.

## Other decisions you can explore

| Decision | Possible criteria | What to keep consistent |
| --- | --- | --- |
| Choose a laptop or product brand | Price, weight, battery life, storage | The same test conditions and specifications |
| Compare rental locations | Rent, travel time, floor area | The same currency, billing period, and destination |
| Compare delivery services | Fee, delivery time, maximum capacity | The same route, parcel, and service conditions |
| Evaluate suppliers | Price, lead time, capacity, defect rate | The same item, order size, and measurement period |

The name of a criterion does not fix its direction. Shorter delivery time is usually better; longer battery life is usually better. You choose the direction for each decision.

## Use the calculator

1. **Criteria and priorities:** add 2–10 criteria, choose units and directions, and compare criterion importance. Templates provide a starting point for price, duration, distance, capacity, or a custom measure.
2. **Alternatives:** enter data for 2–100 options using cards or a table. You do not need to compare every pair of alternatives manually.
3. **Review:** check the values, ranges, units, priorities, and consistency status before calculating.
4. **Results:** read the ranking, compare original values, inspect the calculation, and test each weight at ±10% of its baseline value.

Inputs use a decimal point and no grouping separators: enter `100100`, not `100,100`, and `1.5` for a decimal. Zero is a valid value, including a free cost. An empty field is missing data. All alternatives in one criterion must use the same unit; the app does not convert currencies or units for you.

Drafts stay in your browser. Export a project as JSON to keep a separate copy or continue on another device. Imported projects are validated, and results are calculated again from their inputs. Download the Markdown report for a record of the data, method, matrices, ranking, and tested weight scenarios.

## Run locally

Use Node.js **22.12 or newer**. Install the development dependencies once:

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite; the default is **http://127.0.0.1:4176**. Project inputs are not sent to a backend. After dependencies are installed, the app does not require external CDNs to run.

```sh
npm run typecheck
npm test
npm run build
npm run preview
```

`build` checks the TypeScript types and produces a static website in `dist/`. `preview` serves that build at **http://127.0.0.1:4177**. Serve `dist/` with a static host when publishing. `npm start` is an alias for the local development server. `npm run format:check` checks source formatting.

## Read the result with its assumptions

- **Preferences remain subjective.** Consistency means the comparisons agree internally; it does not prove that the criteria are complete or that the data is correct. A two-criterion comparison has no meaningful consistency ratio.
- **Closeness scores are relative.** They do not measure accuracy, satisfaction, confidence, or probability. Scores across alternatives do not have to sum to 1.
- **The comparison set matters.** Adding an option or an extreme value can change normalization and ranking. Recheck the data ranges and sensitivity before relying on a small lead.
- **Requirements need separate attention.** A supplier may rank highly while exceeding a mandatory budget. This version does not enforce eligibility filters.
- **Avoid counting the same factor twice.** Closely related criteria can amplify one concern. Ratings entered as numbers still carry human judgment.
- **Unit conversions and shifted scales differ.** Converting all prices from Rupiah to thousands of Rupiah preserves the result. Changing the zero point of a scale, such as Celsius to Fahrenheit, is not guaranteed to preserve it.
- **Identical data cannot choose a winner.** Constant criteria contribute no difference. If all alternatives are identical, they share rank 1 and closeness is shown as undefined (`—`).

The sensitivity view tests a relative ±10% change to one weight at a time, then rescales all weights to total 1. It only reports what happened in those scenarios; an unchanged winner is not proof of general robustness.

## Journal references

1. Saaty, T. L. (2008). *Decision making with the analytic hierarchy process*. International Journal of Services Sciences, 1(1), 83–98. [doi:10.1504/IJSSCI.2008.017590](https://doi.org/10.1504/IJSSCI.2008.017590).
2. Zavadskas, E. K., Zakarevicius, A., & Antucheviciene, J. (2006). *Evaluation of Ranking Accuracy in Multi-Criteria Decisions*. Informatica, 17(4), 601–618. [doi:10.15388/Informatica.2006.158](https://doi.org/10.15388/Informatica.2006.158).
3. Akcan, S., & Güldeş, M. (2019). *Integrated Multicriteria Decision-Making Methods to Solve Supplier Selection Problem: A Case Study in a Hospital*. Journal of Healthcare Engineering, 2019, Article 5614892. [doi:10.1155/2019/5614892](https://doi.org/10.1155/2019/5614892).

These references explain the methods and their use in research. They do not establish this application's accuracy or validate its synthetic example.

## Calculation breakdown

The following steps reproduce the supplier example. `i` identifies a supplier; `j` identifies a criterion. Displayed values are rounded; the app calculates at full precision.

### 1. Derive criterion weights with AHP

Price is judged twice as important as delivery:

```text
                 Price    Delivery
Price              1         2
Delivery          1/2        1
```

The priority vector is the normalized principal eigenvector:

```text
w = [2/3, 1/3]
```

The app estimates it through power iteration. For three or more criteria it also calculates:

```text
CI = (lambda_max − n) / (n − 1)
CR = CI / RI[n]
```

This implementation labels `CR < 0.10` consistent, `0.10 ≤ CR < 0.20` review, and `CR ≥ 0.20` inconsistent. It retains the original calculator's RI table, which can differ from tables used in other publications. Reports identify the table version. Two criteria do not receive a CR.

### 2. Normalize each data column

Divide each value by its column's Euclidean norm:

```text
r[i,j] = x[i,j] / sqrt(sum_i(x[i,j]^2))

Price norm    = sqrt(100000^2 + 100100^2) ≈ 141492.084584
Delivery norm = sqrt(10^2 + 1^2)          ≈ 10.049876
```

| Alternative | Normalized price | Normalized delivery |
| --- | ---: | ---: |
| A | 0.7067533162 | 0.9950371902 |
| B | 0.7074600695 | 0.0995037190 |

This step removes the units. The prices stay close together, while the delivery values remain far apart. Cost values are not replaced with `1/x`, so an individual zero is allowed. All-zero columns are explicitly assigned zero normalized values.

### 3. Apply the criterion weights

```text
v[i,j] = w[j] × r[i,j]
```

| Alternative | Weighted price | Weighted delivery |
| --- | ---: | ---: |
| A | 0.4711688775 | 0.3316790634 |
| B | 0.4716400464 | 0.0331679063 |

### 4. Identify the best and worst combinations

For lower-is-better criteria, the best coordinate is the minimum and the worst is the maximum. For higher-is-better criteria, reverse that choice.

```text
Best  = [0.4711688775, 0.0331679063]
Worst = [0.4716400464, 0.3316790634]
```

The best combination takes A's price and B's delivery. It is a reference point, not a third supplier.

### 5. Measure distances and calculate closeness

```text
D_plus[i]  = sqrt(sum_j((v[i,j] − Best[j])^2))
D_minus[i] = sqrt(sum_j((v[i,j] − Worst[j])^2))
C[i]       = D_minus[i] / (D_plus[i] + D_minus[i])
```

| Alternative | Distance to best | Distance to worst | Closeness |
| --- | ---: | ---: | ---: |
| A | 0.2985111571 | 0.0004711689 | 0.0015759088 |
| B | 0.0004711689 | 0.2985111571 | 0.9984240912 |

Sort closeness from highest to lowest: **B, then A**. If both distances are zero, closeness is undefined and the options are reported as equal.

Because Euclidean distance squares weighted differences, weights appear squared inside the distance sum. A doubled weight does not promise a doubled effect on the final closeness score.

## Stack and code structure

| Layer | Technology | Purpose |
| --- | --- | --- |
| Application and calculations | TypeScript with strict checking | Typed project data, AHP/TOPSIS results, validation, and browser interactions |
| Interface | HTML, CSS, native DOM | Responsive four-step workflow without a UI framework |
| Development and production build | Vite | Local server, TypeScript transformation, and static production assets |
| Tests | Node.js test runner + tsx | Run TypeScript tests for calculations, numerical cases, persistence, and import/export |
| Formatting | Prettier | Consistent TypeScript, CSS, and configuration formatting |
| Persistence and exports | Browser localStorage, JSON, Markdown | Local drafts, portable projects, and readable calculation reports |

```text
src/
  app.ts             Browser controller and event handling
  lib/
    types.ts         Project, criterion, alternative, and result types
    ahp.ts           Criterion priority and consistency calculations
    topsis.ts        Normalization, ideals, distances, ranking, sensitivity
    decision.ts      Validated calculation workflow and result snapshot
    project.ts       Project creation, comparisons, validation, JSON decoding
    numbers.ts       Numerical parsing and validation
    storage.ts       Browser draft persistence
    report.ts        Markdown and project JSON exports
    constants.ts     Method settings, RI table, templates, comparison scale
    model.ts         Shared calculation-module exports
  ui/
    views.ts         Page rendering and result explanations
    html.ts          Escaping, formatting, and shared HTML helpers
    types.ts         View state and rendering context
tests/               TypeScript regression and persistence tests
public/docs/         Product specification served with the app
docs/                Product requirements and implementation notes
```

The calculation modules do not depend on the DOM or localStorage. Existing version-1 project JSON and the browser draft key remain compatible. Runtime validation checks imported data before it enters the typed project model.

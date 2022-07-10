---
title: "Climate Change"
toc: true
toc_icon: bars
toc_sticky: true
feature_row:
  - image_path: assets/images/skyshares-cap.png
    alt: "Cap"
    excerpt: "<h1>Cap</h1> Set a temperature target and see how much of the carbon budget we have left"
  - image_path: assets/images/skyshares-allocate.png
    alt: "Allocate"
    excerpt: "<h1>Allocate</h1> Decide how the carbon budget should be shared among countries"
  - image_path: assets/images/skyshares-trade.png
    alt: "Trade"
    excerpt: "<h1>Trade</h1> Calculate how much to decarbonize at home and how many allowances to buy"
gallery:
  - url: /assets/images/SkyShares-emissions.png
    image_path: assets/images/SkyShares-emissions.png
    alt: "Emissions"
  - url: /assets/images/SkyShares-allowances.png
    image_path: assets/images/SkyShares-allowances.png
    alt: "Allowances"
  - url: /assets/images/SkyShares-transfers.png
    image_path: assets/images/SkyShares-transfers.png
    alt: "Transfers"
  - url: /assets/images/SkyShares-flows.png
    image_path: assets/images/SkyShares-flows.png
    alt: "Financial flows"
  - url: /assets/images/SkyShares-decarb-costs.png
    image_path: assets/images/SkyShares-decarb-costs.png
    alt: "Decarbonization costs"
  - url: /assets/images/SkyShares-total-costs.png
    image_path: assets/images/SkyShares-total-costs.png
    alt: "Total costs"
---

One of my main research streams is the design of policies to mitigate climate change.

## SkyShares

[SkyShares](http://www.skyshares.org/) is a tool that I created while at the [Center for Global Development](https://www.cgdev.org/) to aid decision-making in international climate negotiations.

{% include figure 
  image_path = "/assets/images/skyshares-intro.png" 
  alt = "Elevator pitch of SkyShares" %}

Decision-makers can use SkyShares to model the financial flows and economic costs of a climate deal where the world has set a carbon budget in order to limit dangerous and run-away climate change.

Atmospheric real-estate is running out. Any climate deal must be **environmentally sound** and set a cap on how much the world can emit. SkyShares calculates how much the world has left to emit using the latest scientific evidence.

CO<sub>2</sub> allowances are valuable resources. Rather than thinking about climate as a burden-sharing problem, SkyShares allows users to model a climate deal as an asset-sharing problem in order to generate an **equitable** allocation of emissions permits in the climate talks. 

Trading is a least-cost way for countries to reduce their emissions because it ensures decarbonization happens where it is cheapest. SkyShares can be used to compute an **economically efficient** climate deal.

SkyShares allows users to simulate a Cap-Allocate-and-Trade deal.

{% include feature_row %}

SkyShares offers various scenarios for the user to simulate the resulting economic and environmental consequences.

{% include figure 
  image_path = "/assets/images/skyshares-flowchart.png" 
  alt = "SkyShares flowchart" %}

### Carbon budget
SkyShares uses the latest scientific evidence to program the relationship between cumulative carbon emissions (all-time) and peak warming relative to pre-industrial levels. The user sets a temperature target, and SkyShares will return the remaining allowable emissions of CO<sub>2</sub> in the budget. SkyShares then "spreads" the all-time cumulative emissions budget (a finite quantity) into discrete annual carbon budgets by plotting an idealized emissions pathway. The trajectory is a smooth-capped distribution which increases and decreases exponentially before and after the start of a mitigation scheme. The user can choose to delay the start of the global mitigation regime. SkyShares numerically solves for the required mitigation rate that ensures the planet's emissions trajectory will stay within the confines of the global carbon budget.

### Allocation rule
SkyShares offers a variety of algorithms to distribute the yearly carbon budget among the countries the user has chosen to participate in the coalition.

  * **Per capita**: Allowances are grandfathered from current emissions shares and converge to per capita entitlements at a date chosen by the user.
  * **Equal stocks**: Allowances also converge to equal per capita entitlements, but this takes into account the stock of past emissions. SkyShares computes the carbon owed by each country since 1800 or 1990, and future allowances are adjusted accordingly so that the carbon debt is paid back at the end of the century. The user can choose the repayment schedule for the servicing of that debt (linear, postpone or frontload).
  * **Historical responsibilities**: Calculates the share of global emissions that past emitters have been responsible for, and mandates the same rate of mitigation effort in the future. This variant of the carbon debt scenario is more severe in its treatment of past emitters.
  * **Per dollar**: Allowances converge to shares of GDP. This scenario distributes allowances to the richest, and is intended to help visualize the distributional implications of the status quo.

### Trading scenarios

The market-clearing price of allowances is determined endogenously by matching supply and demand for abatement. SkyShares then maps back the equilibrium price to each country's marginal abatement cost (MAC) curve to determine how much abatement each country provides at the world price. The rest is traded.

  * **Full trade**: SkyShares determines the optimal mix of decarbonizing at home and of buying allowances on the market so as to minimize costs. There is a "no banking, no borrowing" rule and the market clears every year. This scenario is a cost-minimizing one.
  * **No trade**: The user can turn trading off, and countries will be forced to meet their abatement target entirely through domestic emissions reduction.
  * **Regulation**: The user can act as the central planner and mandate what share of the coalition's abatement target must be decarbonized at home.

SkyShares computes the financial flows and decarbonization costs of each trading scenario for each
country. Whatever scenario is chosen, the coalition will always stay within its carbon budget.

### Results

My co-authors ([Owen Barder](https://www.owen.org/) and [Alex Evans](https://cic.nyu.edu/people/alex-evans)) and I have run SkyShares on what we call a Reference Scenario that we argue in [this paper](https://www.cgdev.org/publication/skyshares-modelling-economic-implications-future-global-emissions-budget) is a climate deal that will deliver the triple win of environmental sustainability, climate equity, and economic efficiency.

The Reference Scenario presumes all countries in the world join the coalition at the outset; sets a carbon budget consistent with a 50% likelihood of stabilizing temperature at 2°C; assumes mitigation starts early; allocates the emissions budget proportionally with a convergence to per capita shares in 2030; and allows full trading.

Our headline finding is that an approach based on fair shares of a global emissions budget is both affordable for higher emitting countries, and potentially game-changing as a source of finance for development for lower income countries if emissions trading is permitted.

In our Reference Scenario, we find that high income countries as a group would face net costs of only 0.56% of GDP a year in 2025 and 1.45% in 2030, rising to 2.97% by 2050. The United States would face net costs of 0.73% of GDP a year in 2025, and the European Union 0.30%. 

On the other hand, lower emitting emerging economies would be net beneficiaries of the framework in early decades: India would gain 2.63% of GDP a year in 2025 and Brazil 0.50%, though they would then face net costs rather than benefits from around 2045 onwards.

Low income countries, finally, would stand to gain substantially in our Reference Scenario, given their very low per capita emissions. Ethiopia, for example, would stand to make 27.23% of its GDP a year by 2025, and Bangladesh 10.96%; low income countries as a group would gain 6.45% in 2025.

In dollar terms, the net financial flows to lower middle income countries would amount to $262.8 billion in 2025 (nearly twice as much as the $134.8 billion of total global Official Development Assistance flows in 2013), while those to LICs would total approximately $153 billion. This would therefore represent a major new source of finance for development and for delivering the Sustainable Development Goals.

The gallery below displays the emissions budget, allowances, transfers, financial flows, decarbonization costs, and total costs of the Reference Scenario.

{% include gallery 
  caption = "Figures generated by SkyShares for the Reference Scenario." %}

## Carbon pricing

One of my research interests is the design of carbon pricing instruments in a second-best world. I have [written](https://www.cgdev.org/blog/global-carbon-tax-or-cap-and-trade-part-1-economic-arguments) about the pros and cons of cap-and-trade schemes versus carbon taxes.

I have a [paper](https://link.springer.com/content/pdf/10.1007/s10584-021-03111-2.pdf) with [Matto Mildenberger](https://www.mattomildenberger.com/) in *Climatic Change* that evaluates the environmental effectiveness of a carbon pricing policy in the United Kingdom using synthetic control methods.

**Abstract.**
Following the failure of climate governance regimes that sought to impose legally binding treaty-based obligations, the Paris Agreement relies on voluntary actions by individual countries. Yet, there is no guarantee that unilateral policies will lead to a decrease in carbon emissions. Critics worry that voluntary climate measures will be weak and ineffective, and insights from political economy imply that regulatory loopholes are likely to benefit carbon-intensive sectors. Here, we empirically evaluate whether unilateral action can still reduce carbon pollution by estimating the causal effect of the UK's 2001 Climate Change Programme (CCP) on the country's carbon emissions. Existing efforts to evaluate the overall impact of climate policies on national carbon emissions rely on Business-As-Usual (BAU) scenarios to project what carbon emissions would have been without a climate policy. We instead use synthetic control methods to undertake an *ex post* national-level assessment of the UK's CCP without relying on parametric BAU assumptions and demonstrate the potential of synthetic control methods for climate policy impact evaluation. Despite setting lax carbon targets and making substantial concessions to producers, we show that, in 2005, the UK's CO<sub>2</sub> emissions per capita were 9.8% lower relative to what they would have been if the CCP had not been passed. Our findings offer empirical confirmation that unilateral climate policies can still reduce carbon emissions, even in the absence of a binding global climate agreement and in the presence of regulatory capture by industry.
{: .notice--primary}

We construct a synthetic counterfactual by creating a weighted combination of countries that most closely resembled the UK before the policy was implemented. The figure below displays the emissions trajectories of the UK (solid line) and the synthetic UK (the dashed line). The causal impact of the policy is the difference between the two.

{% include figure 
  image_path = "/assets/images/synth-emissions-pathways.png" 
  alt = "Emissions trajectories in treated and synthetic control" %}  